'use client';

export function ChatSidebar() {
  return (
    <div className="chat">
      <div className="chat__heading d-flex align-center justify-space-between">
        <div className="chat__online d-flex align-center">
          <svg className="icon"><use xlinkHref="/images/symbols.svg#users" /></svg>
          <div>
            <span>Online</span>
            <p className="online">0</p>
          </div>
        </div>
        <div className="chat__buttons d-flex align-center justify-end">
          <a href="#" className="d-flex align-center justify-center" aria-label="Rules">
            <svg className="icon"><use xlinkHref="/images/symbols.svg#rules" /></svg>
          </a>
          <a href="#" className="close-chat d-flex align-center justify-center" aria-label="Close chat">
            <svg className="icon"><use xlinkHref="/images/symbols.svg#close" /></svg>
          </a>
        </div>
      </div>

      <div className="chat__messages">
        <div style={{ padding: '1rem', color: '#7485b7', fontSize: '12px' }}>Chat messages load here</div>
      </div>

      <div className="chat__bottom">
        <div className="chat__send d-flex align-center justify-space-between">
          <div className="chat__input">
            <input
              type="text"
              id="messageChat"
              placeholder="Type your message..."
              disabled
              style={{ cursor: 'not-allowed' }}
            />
          </div>
          <div className="chat__buttons d-flex align-center">
            <a href="#" className="d-flex align-center justify-center" aria-label="Send">
              <svg className="icon"><use xlinkHref="/images/symbols.svg#send" /></svg>
            </a>
            <a href="#" className="d-flex align-center justify-center" id="btnStickers" aria-label="Stickers">
              <svg className="icon"><use xlinkHref="/images/symbols.svg#stickers" /></svg>
            </a>
            <a href="#" className="d-flex align-center justify-center" id="btnSmiles" aria-label="Smiles">
              <svg className="icon"><use xlinkHref="/images/symbols.svg#smiles" /></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
