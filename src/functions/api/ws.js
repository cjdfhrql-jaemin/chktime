import { upgradeWebSocket } from 'hono/cloudflare-workers'

export const handleWebSocket = upgradeWebSocket((c) => {
  let isFinished = false;

  return {
    onMessage(event, ws) {
      if (event.data === 'READY') {
        let progress = 0;
        isFinished = false;

        // [근본 해결] 재귀 setTimeout 대신 선형적인 async 루프 사용
        const runScan = async () => {
          while (progress < 100) {
            // 1. 탈출 조건 체크
            if (isFinished || ws.readyState !== WebSocket.OPEN) {
              break;
            }

            progress += 1;

            // 2. 상태 전송
            const status = progress >= 100 ? 'DONE' : 'SCANNING';
            ws.send(JSON.stringify({ 
              type: 'PROGRESS', 
              value: progress, 
              status: status 
            }));

            // 3. 100% 완료 시 루프 탈출
            if (progress >= 100) {
              isFinished = true;
              break;
            }

            // 4. 비동기 대기 (랜덤 틱)
            const nextTick = Math.floor(Math.random() * 30) + 1;
            await new Promise((resolve) => {
              setTimeout(resolve, nextTick);
            });
          }

          // 5. 루프 종료 후 소켓 정리
          if (ws.readyState === WebSocket.OPEN) {
            // 런타임이 '끝났다'고 인지하도록 명시적으로 닫음
            ws.close();
          }
        };

        // 비동기로 실행하되, 에러를 던지지 않도록 처리
        runScan().catch((err) => {
          console.error("Scan Error:", err);
        });
      }
    },
    onClose: () => {
      isFinished = true;
      console.log('WS Closed: Resources Cleaned Up');
    }
  };
})

export default handleWebSocket;