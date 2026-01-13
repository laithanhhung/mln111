import type { ChatMessage } from '../types/game';

export class ChatOverlay {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  clear(): void {
    this.container.innerHTML = '';
  }

  addMessage(message: ChatMessage): void {
    const row = document.createElement('div');
    row.className = `chat-message-row chat-sender-${message.sender.toLowerCase()}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = message.text;

    if (message.sender === 'LUMEN') {
      const avatarWrapper = document.createElement('div');
      avatarWrapper.className = 'chat-avatar-wrapper';

      const avatar = document.createElement('div');
      avatar.className = 'chat-avatar lumen';

      // Thử load avatar thật, nếu lỗi thì dùng placeholder "L"
      const img = document.createElement('img');
      img.alt = 'Lumen';
      img.draggable = false;

      // Hỗ trợ cả ch_lumen_avatar và lumen_avatar
      let src = '/assets/characters/lumen_avatar.png';
      if (message.avatarAlias === 'ch_lumen_avatar' || message.avatarAlias === 'lumen_avatar') {
        src = '/assets/characters/lumen_avatar.png';
      }

      img.src = src;
      img.onerror = () => {
        img.remove();
        avatar.classList.add('chat-avatar-placeholder');
        avatar.textContent = 'L';
      };

      avatar.appendChild(img);

      // Glow khi Lumen "bí ẩn" hoặc "warm"
      if (message.mode === 'ominous') {
        avatar.classList.add('chat-avatar-ominous');
      } else if (message.mode === 'warm') {
        avatar.classList.add('chat-avatar-warm');
      }

      avatarWrapper.appendChild(avatar);
      row.appendChild(avatarWrapper);
      row.appendChild(bubble);
    } else {
      // Các sender khác: chỉ hiển thị bubble
      row.appendChild(bubble);
    }

    this.container.appendChild(row);
    this.container.scrollTop = this.container.scrollHeight;
    
    // Animation fade in
    row.style.opacity = '0';
    row.style.transform = 'translateY(10px)';
    setTimeout(() => {
      row.style.transition = 'opacity 0.3s, transform 0.3s';
      row.style.opacity = '1';
      row.style.transform = 'translateY(0)';
    }, 10);
  }
}
