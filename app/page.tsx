import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ChatSidebar } from '@/app/components/ChatSidebar';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const balance = session
    ? session.user.type_balance === 0
      ? session.user.balance
      : session.user.demo_balance
    : null;

  return (
    <div id="app">
      <aside className="sidebar">
        <div className="sidebar__inner d-flex justify-space-between flex-column">
          <div className="sidebar__top">
            <div className="sidebar__logotype">
              <Link href="/"><span aria-hidden="true">&nbsp;</span></Link>
            </div>
            <div className="sidebar__block sidebar__games d-flex flex-column justify-center align-center">
              <Link href="/shoot" className="sidebar__game game_shoot d-flex justify-center align-center">
                <div className="sidebar__game-center d-flex align-center justify-center">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#hunt" /></svg>
                </div>
                <div className="sidebar__game-name d-flex align-center flex-end">
                  <span>CrazyShoot</span>
                </div>
                <div className="sidebar__game--hover" />
              </Link>
              <Link href="/x100" className="sidebar__game game_x100 d-flex justify-center align-center">
                <div className="sidebar__game-center d-flex align-center justify-center">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#x100" /></svg>
                </div>
                <div className="sidebar__game-name d-flex align-center flex-end">
                  <span>X100</span>
                </div>
                <div className="sidebar__game--hover" />
              </Link>
              <Link href="/x30" className="sidebar__game game_x30 d-flex justify-center align-center">
                <div className="sidebar__game-center d-flex align-center justify-center">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#x30" /></svg>
                </div>
                <div className="sidebar__game-name d-flex align-center flex-end">
                  <span>X30</span>
                </div>
                <div className="sidebar__game--hover" />
              </Link>
              <Link href="/crash" className="sidebar__game game_crash d-flex justify-center align-center">
                <div className="sidebar__game-center d-flex align-center justify-center">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#crash" /></svg>
                </div>
                <div className="sidebar__game-name d-flex align-center flex-end">
                  <span>Crash</span>
                </div>
                <div className="sidebar__game--hover" />
              </Link>
              <Link href="/dice" className="sidebar__game game_dice d-flex justify-center align-center">
                <div className="sidebar__game-center d-flex align-center justify-center">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#dice" /></svg>
                </div>
                <div className="sidebar__game-name d-flex align-center flex-end">
                  <span>Dice</span>
                </div>
                <div className="sidebar__game--hover" />
              </Link>
              <Link href="/mines" className="sidebar__game game_mines d-flex justify-center align-center">
                <div className="sidebar__game-center d-flex align-center justify-center">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#mines" /></svg>
                </div>
                <div className="sidebar__game-name d-flex align-center flex-end">
                  <span>Mines</span>
                </div>
                <div className="sidebar__game--hover" />
              </Link>
              <Link href="/coinflip" className="sidebar__game game_coinflip d-flex justify-center align-center">
                <div className="sidebar__game-center d-flex align-center justify-center">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#coinflip" /></svg>
                </div>
                <div className="sidebar__game-name d-flex align-center flex-end">
                  <span>Coin Flip</span>
                </div>
                <div className="sidebar__game--hover" />
              </Link>
              <Link href="/keno" className="sidebar__game game_keno d-flex justify-center align-center">
                <div className="sidebar__game-center d-flex align-center justify-center">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#keno" /></svg>
                </div>
                <div className="sidebar__game-name d-flex align-center flex-end">
                  <span>Keno</span>
                </div>
                <div className="sidebar__game--hover" />
              </Link>
            </div>
            {session && (
              <div className="sidebar__block sidebar__profile d-flex justify-center align-center flex-column">
                <div
                  className="sidebar__user-avatar"
                  style={session.user?.image ? { background: `url(${session.user.image}) no-repeat center center / cover` } : undefined}
                />
              </div>
            )}
          </div>
          
        </div>
      </aside>

      <header className="header">
        <div className="wrapper d-flex align-center justify-space-between flex-wrap">
          <nav className="header__links d-flex align-center">
            <li><Link href="/" className="d-flex align-center"><svg className="icon"><use xlinkHref="/images/symbols.svg#home" /></svg><span>Home</span></Link></li>
            <li><Link href="/profile" className="d-flex align-center"><svg className="icon"><use xlinkHref="/images/symbols.svg#giveaway" /></svg><span>Bonuses</span></Link></li>
            <li><Link href="/profile" className="d-flex align-center"><svg className="icon"><use xlinkHref="/images/symbols.svg#faq" /></svg><span>F.A.Q</span></Link></li>
            <li><a href="https://t.me/mortalsoft" target="_blank" rel="noopener noreferrer" className="d-flex align-center"><svg className="icon"><use xlinkHref="/images/symbols.svg#support" /></svg><span>Support</span></a></li>
          </nav>
          <div className="header__right d-flex align-center">
            <div className="sidebar__logotype flare">
              <Link href="/"><span aria-hidden="true">&nbsp;</span></Link>
            </div>
            {session ? (
              <div className="header__user d-flex align-center justify-space-between">
                <div className="header__user-balance d-flex align-center">
                  <div className="header__user-b d-flex align-center">
                    <span id="balance">{balance ?? 0}</span>
                    <svg className="icon"><use xlinkHref="/images/symbols.svg#coins" /></svg>
                  </div>
                  <div className="header__user-balance-add">
                    <Link href="/profile" className="btn is-ripples flare d-flex align-center"><span>DEPOSIT</span></Link>
                  </div>
                </div>
                <div className="header__user-profile d-flex align-center" id="dropdownUser">
                  <svg className="icon"><use xlinkHref="/images/symbols.svg#user" /></svg>
                  <div className="header__user-dropdown d-flex flex-column">
                    <span className="header__user-dropdown--id d-flex align-center">ID: <b>{session.user?.id}</b></span>
                    <Link href="/profile" className="d-flex align-center">
                      <svg className="icon"><use xlinkHref="/images/symbols.svg#user" /></svg>
                      <span>Profile</span>
                    </Link>
                    <form action="/api/auth/signout" method="POST">
                      <button type="submit" className="d-flex align-center" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '18px 21px', cursor: 'pointer' }}>
                        <svg className="icon"><use xlinkHref="/images/symbols.svg#exit" /></svg>
                        <span>Sign out</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn is-ripples btn--blue d-flex align-center flare"><span>LOG IN</span></Link>
            )}
          </div>
        </div>
      </header>

      <main id="_ajax_content_">
        <div className="wrapper">
          <div className="tournier" style={{ marginTop: '20px' }}>
            <Link href="/profile" className="tournier__link d-flex align-center justify-space-between">
              <div className="d-flex align-center">
                <svg className="icon"><use xlinkHref="/images/symbols.svg#tournier" /></svg>
                <b>Tournaments</b>
              </div>
              <span>Go to tournaments</span>
            </Link>
          </div>

          <div className="games">
            <Link href="/slots" className="games__item games__item--slots flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>SLOTS</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/shoot" className="games__item games__item--shoot flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>Crazy <br /> Shoot</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/x100" className="games__item games__item--x100 flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>X100</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/x30" className="games__item games__item--x30 flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>X30</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/dice" className="games__item games__item--dice flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>Dice</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/mines" className="games__item games__item--mines flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>Mines</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/crash" className="games__item games__item--crash flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>Crash</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/coinflip" className="games__item games__item--coin flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>Coin Flip</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/keno" className="games__item games__item--keno flare d-flex align-end">
              <div className="games__item-text d-flex flex-column">
                <span>Keno</span>
                <p>? players</p>
              </div>
            </Link>
            <Link href="/boomcity" className="games__item games__item--soon games__item--boomcity flare d-flex align-end">
              <div className="games__item-soon">
                <span>Soon</span>
              </div>
              <div className="games__item-text d-flex flex-column">
                <span>Boom <br /> City</span>
                <p>? players</p>
              </div>
              <div className="games__item-bg--dice-3" />
              <div className="games__item-bg--dice-2" />
              <div className="games__item-bg-confetti" />
              <div className="games__item-bg-ellipse" />
            </Link>
          </div>
        </div>

        <div className="wrapper">
          <div className="history">
            <table>
              <thead>
                <tr>
                  <td>Game</td>
                  <td>Player</td>
                  <td>Bet</td>
                  <td>Multiplier</td>
                  <td>Win</td>
                </tr>
              </thead>
              <tbody className="gameHistory">
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: '#7485b7' }}>No recent games</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {session?.user?.admin === 1 && (
          <div className="wrapper" style={{ marginTop: '1rem' }}>
            <Link href="/admin" className="btn btn--red d-flex align-center"><span>Admin panel</span></Link>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="wrapper d-flex align-center justify-space-between flex-wrap">
          <nav className="footer__links d-flex align-center">
            <li className="footer__link"><Link href="/">Terms</Link></li>
            <li className="footer__link"><Link href="/">Privacy</Link></li>
          </nav>
          <div className="footer__text"><span>All rights reserved.</span></div>
        </div>
      </footer>

      <ChatSidebar />
    </div>
  );
}
