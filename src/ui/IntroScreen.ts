export class IntroScreen {
  private container: HTMLElement;
  private onStart?: () => void;
  private onBack?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  show(onStart: () => void, onBack?: () => void): void {
    this.onStart = onStart;
    this.onBack = onBack;

    const introText = `Bạn mở mắt trong căn phòng trọ tối, đồng hồ nhảy đúng 23:47. Màn hình điện thoại sáng lên liên tục, tim bạn đập nhanh dù bạn chưa chạm vào gì cả. Nhật ký — thứ bạn viết để giữ mình khỏi vỡ — đã bị ai đó chụp lại và ném lên group lớp. Những dòng chữ từng là nơi an toàn giờ biến thành trò cười, và bạn không biết ai là người làm chuyện đó.

Bạn định im lặng cho qua. Bạn định khóa tất cả lại.
Nhưng rồi một tin nhắn từ Lumen xuất hiện:

"Cậu đang định gửi đoạn nhật ký đó vào group phải không?"

Bạn chưa hề mở nhật ký.

Từ khoảnh khắc này, bạn chính là Minh. Bạn sẽ chọn cách sống trong 7 ngày tới: đối mặt hay trốn chạy, tin người hay chỉ tin AI, giữ mình bằng thực tại hay bằng ảo giác an toàn. Và mỗi lựa chọn của bạn sẽ để lại dấu vết—không chỉ trong câu chuyện, mà trong chính cách bạn hiểu về bản thân.`;

    // Format text: split by newlines, preserve empty lines as breaks
    const formattedText = introText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('');

    this.container.innerHTML = `
      <div class="intro-screen">
        <div class="intro-content">
          <div class="intro-logo">
            <img src="/assets/logo.png" alt="Đêm 23:47" onerror="this.style.display='none'">
          </div>
          <h1>Đêm 23:47</h1>
          <div class="intro-scroll">
            <div class="intro-section">
              ${formattedText}
            </div>
          </div>
          <div class="intro-actions">
            ${onBack ? `<button id="intro-back-btn" class="intro-btn secondary">Quay lại menu</button>` : ''}
            <button id="intro-start-btn" class="intro-btn primary">Bắt đầu</button>
          </div>
        </div>
      </div>
    `;

    this.container.style.display = 'block';

    // Attach event listeners
    const startBtn = this.container.querySelector('#intro-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (this.onStart) this.onStart();
      });
    }

    const backBtn = this.container.querySelector('#intro-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.onBack) this.onBack();
      });
    }
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }
}
