import './_group.css';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ChefHat,
  ChevronRight,
  CircleDollarSign,
  CircleDot,
  Clock3,
  CookingPot,
  Egg,
  Flame,
  Gauge,
  MapPin,
  Package,
  Paintbrush,
  RotateCcw,
  ShoppingBasket,
  Soup,
  Sparkles,
  Star,
  Store,
  Swords,
  Target,
  Truck,
  Users,
  Utensils,
  Zap,
} from 'lucide-react';

const ingredients = [
  { name: 'Noodles', amount: 10, price: '$50', icon: 'noodles' },
  { name: 'Broth', amount: 10, price: '$50', icon: 'broth' },
  { name: 'Spice', amount: 10, price: '$20', icon: 'spice' },
  { name: 'Eggs', amount: 10, price: '$80', icon: 'egg' },
  { name: 'Boba', amount: 10, price: '$150', icon: 'boba' },
  { name: 'Chashu', amount: 10, price: '$120', icon: 'chashu' },
  { name: 'Nori', amount: 10, price: '$70', icon: 'nori' },
  { name: 'Bamboo Shoots', amount: 10, price: '$60', icon: 'bamboo' },
];

const navigation = [
  { name: 'Dining', icon: Utensils },
  { name: 'Kitchen', icon: CookingPot },
  { name: 'Staff', icon: Users },
  { name: 'Turf Wars', icon: Swords },
  { name: 'Decor', icon: Paintbrush },
  { name: 'Missions', icon: Target },
];

const upgrades = ['Table', 'Recipe', 'Wok', 'Auto', 'Ads', 'Bowl'];

function IngredientMark({ kind }: { kind: string }) {
  if (kind === 'egg') return <Egg size={17} strokeWidth={1.8} />;
  if (kind === 'noodles') return <Soup size={17} strokeWidth={1.8} />;
  if (kind === 'broth') return <CookingPot size={17} strokeWidth={1.8} />;
  if (kind === 'boba') return <CircleDot size={17} strokeWidth={1.8} />;
  if (kind === 'chashu') return <Package size={17} strokeWidth={1.8} />;
  if (kind === 'nori') return <Sparkles size={17} strokeWidth={1.8} />;
  if (kind === 'bamboo') return <Zap size={17} strokeWidth={1.8} />;
  return <Flame size={17} strokeWidth={1.8} />;
}

export function Redesign() {
  const [notice, setNotice] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [activeTab, setActiveTab] = useState('Dining');

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const announce = (message: string) => setNotice(message);

  return (
    <div className="rmr">
      <style>{`
        .rmr {
          --paper: #f2eadb;
          --paper-light: #faf5eb;
          --ink: #273b37;
          --muted: #75827a;
          --line: rgba(49, 69, 61, .14);
          --teal: #276f66;
          --teal-dark: #194d49;
          --mint: #cce4d4;
          --coral: #c76e50;
          --gold: #e2b35e;
          min-height: 100dvh;
          padding: clamp(16px, 2.7vw, 34px);
          color: var(--ink);
          background:
            radial-gradient(ellipse at 8% 0%, rgba(228, 189, 123, .21), transparent 28rem),
            radial-gradient(ellipse at 94% 22%, rgba(112, 166, 147, .16), transparent 30rem),
            var(--paper);
          font-family: "DM Sans", "Nunito", sans-serif;
          box-sizing: border-box;
        }
        .rmr * { box-sizing: border-box; }
        .rmr button { font: inherit; }
        .rmr button:focus-visible { outline: 3px solid #ce7a55; outline-offset: 3px; }
        .rmr-shell { width: min(1420px, 100%); margin: 0 auto; }
        .rmr-header {
          display: flex; align-items: center; gap: 16px; margin-bottom: 21px;
        }
        .rmr-mark {
          display: grid; place-items: center; width: 56px; height: 56px; flex: 0 0 56px;
          color: #fff5e5; border-radius: 18px 18px 18px 7px;
          background: linear-gradient(145deg, #347d70, #1d514d);
          box-shadow: 0 9px 20px rgba(25, 77, 73, .19);
        }
        .rmr-brand { min-width: 0; }
        .rmr-eyebrow {
          color: #9a6845; font-size: 9px; font-weight: 900; letter-spacing: .2em;
        }
        .rmr-brand h1 {
          margin: 3px 0 1px; color: #263c37; font-family: "Space Grotesk", "DM Sans", sans-serif;
          font-size: clamp(21px, 3vw, 30px); font-weight: 700; letter-spacing: -.065em; line-height: 1;
        }
        .rmr-brand h1 span { color: var(--coral); }
        .rmr-brand p { margin: 5px 0 0; color: #7b8377; font-size: 12px; }
        .rmr-header-end { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        .rmr-store-tag, .rmr-live {
          display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px;
          border: 1px solid var(--line); border-radius: 999px; background: rgba(250,245,235,.72);
          color: #5e6f65; font-size: 9px; font-weight: 900; letter-spacing: .12em; white-space: nowrap;
        }
        .rmr-live { border-color: rgba(39,111,102,.18); color: #236957; background: #e2f0df; }
        .rmr-live i { width: 7px; height: 7px; border-radius: 50%; background: #49a67b; box-shadow: 0 0 0 4px rgba(73,166,123,.12); }
        .rmr-economy {
          display: grid; grid-template-columns: minmax(190px, 1.18fr) repeat(5, minmax(105px, .72fr));
          gap: 1px; overflow: hidden; margin-bottom: 13px; border: 1px solid var(--line);
          border-radius: 17px; background: rgba(95, 96, 71, .13);
          box-shadow: 0 11px 27px rgba(75, 60, 41, .06);
        }
        .rmr-money, .rmr-stat {
          min-height: 77px; padding: 14px 17px; background: rgba(250,245,235,.92);
        }
        .rmr-money { display: flex; flex-direction: column; justify-content: center; }
        .rmr-label {
          display: flex; align-items: center; gap: 7px; color: #8a8272;
          font-size: 9px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase;
        }
        .rmr-money strong {
          margin-top: 4px; color: #24735d; font-family: "Space Grotesk", sans-serif;
          font-size: 26px; letter-spacing: -.055em; line-height: 1.05;
        }
        .rmr-stat strong {
          display: block; margin-top: 7px; color: #2f4941; font-family: "Space Grotesk", sans-serif;
          font-size: 17px; letter-spacing: -.04em; white-space: nowrap;
        }
        .rmr-stat small { color: #929183; font-size: 10px; }
        .rmr-stat .rmr-stat-main { display: flex; align-items: center; gap: 6px; }
        .rmr-stat svg { color: #9b7650; }
        .rmr-tabs {
          display: flex; gap: 5px; overflow-x: auto; margin: 0 0 17px; padding: 6px;
          border: 1px solid rgba(71,82,66,.12); border-radius: 14px;
          background: rgba(250,245,235,.78);
        }
        .rmr-tab {
          display: inline-flex; flex: 1 0 auto; align-items: center; justify-content: center; gap: 8px;
          min-height: 39px; padding: 0 13px; color: #748077; border: 1px solid transparent;
          border-radius: 10px; background: transparent; cursor: pointer; font-size: 11px; font-weight: 800;
          transition: background .18s ease, color .18s ease, transform .18s ease;
        }
        .rmr-tab:hover { color: var(--teal-dark); background: rgba(39,111,102,.07); transform: translateY(-1px); }
        .rmr-tab.active { color: #fffaf1; border-color: #21615a; background: var(--teal); box-shadow: 0 5px 12px rgba(34,101,91,.18); }
        .rmr-main {
          display: grid; grid-template-columns: minmax(0, 1.62fr) minmax(295px, .78fr);
          gap: 15px; align-items: stretch;
        }
        .rmr-room-card, .rmr-side-card, .rmr-pantry, .rmr-upgrades {
          border: 1px solid rgba(75,87,67,.15); border-radius: 19px;
          background: rgba(250,245,235,.88); box-shadow: 0 13px 30px rgba(72,57,39,.07);
        }
        .rmr-room-card { min-width: 0; overflow: hidden; padding: 12px; }
        .rmr-room-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 3px 5px 11px; }
        .rmr-room-title { display: flex; align-items: center; gap: 9px; }
        .rmr-room-title-icon { display: grid; place-items: center; width: 34px; height: 34px; color: #2b7568; border-radius: 11px; background: #e4ecda; }
        .rmr-room-title h2 { margin: 0; font-family: "Space Grotesk", sans-serif; font-size: 15px; letter-spacing: -.035em; }
        .rmr-room-title p { margin: 3px 0 0; color: #8a8778; font-size: 10px; }
        .rmr-room-loc { display: flex; align-items: center; gap: 5px; color: #7c8374; font-size: 10px; font-weight: 700; }
        .rmr-scene {
          position: relative; min-height: 420px; height: clamp(400px, 42vw, 505px); overflow: hidden;
          isolation: isolate; border: 1px solid rgba(250,229,186,.18); border-radius: 14px;
          background: #2c4545;
        }
        .rmr-wall {
          position: absolute; inset: 0 0 42% 0; overflow: hidden;
          background:
            linear-gradient(90deg, rgba(246,220,170,.055) 1px, transparent 1px) 0 0/56px 56px,
            linear-gradient(rgba(246,220,170,.045) 1px, transparent 1px) 0 0/56px 56px,
            linear-gradient(130deg, #344e4e, #263b3d 72%);
        }
        .rmr-window {
          position: absolute; top: 12%; left: 8%; width: 25%; height: 49%; overflow: hidden;
          border: 7px solid #302f31; border-radius: 5px; background:
            linear-gradient(180deg, #384761 0%, #658c89 61%, #debd83 62%, #96765c 100%);
          box-shadow: 0 0 0 1px rgba(255,223,164,.15), 0 0 34px rgba(121,201,183,.12);
        }
        .rmr-moon { position: absolute; top: 12%; right: 14%; width: 24px; height: 24px; border-radius: 50%; background: #f1d8a4; box-shadow: 0 0 20px rgba(255,220,156,.55); }
        .rmr-cityline { position: absolute; right: 0; bottom: 0; left: 0; height: 40%; opacity: .76;
          background: linear-gradient(90deg, transparent 0 4%, #354a4e 4% 12%, transparent 12% 17%, #273a43 17% 25%, transparent 25% 31%, #354a4e 31% 39%, transparent 39% 44%, #293b42 44% 54%, transparent 54% 59%, #3c5252 59% 67%, transparent 67% 72%, #263a40 72% 83%, transparent 83% 88%, #354a4e 88% 96%, transparent 96%);
        }
        .rmr-cityline::after { content: ""; position: absolute; inset: 35% 0 0; background: repeating-linear-gradient(90deg, transparent 0 15px, rgba(247,205,128,.65) 16px 18px, transparent 19px 30px); opacity: .54; }
        .rmr-shop-sign {
          position: absolute; top: 13%; left: 50%; padding: 11px 18px 9px; transform: translateX(-50%) rotate(-1deg);
          color: #ffdda0; border: 1px solid rgba(247,192,110,.63); border-radius: 7px;
          background: rgba(60,47,43,.82); box-shadow: 0 0 21px rgba(236,165,84,.17), inset 0 0 15px rgba(240,182,102,.08);
          text-align: center; font-family: "Space Grotesk", sans-serif; font-size: 12px; font-weight: 700; line-height: .95; letter-spacing: .13em;
        }
        .rmr-shop-sign span { display: block; margin-top: 4px; color: #91d6c1; font-size: 10px; }
        .rmr-lamp { position: absolute; top: 42%; width: 40px; height: 45px; border-top: 2px solid rgba(241,203,137,.54); }
        .rmr-lamp::before { content: ""; position: absolute; top: 0; left: 50%; width: 23px; height: 14px; transform: translateX(-50%); border-radius: 3px 3px 10px 10px; background: #d7a762; box-shadow: 0 4px 19px rgba(247,191,110,.36); }
        .rmr-lamp.left { left: 41%; }
        .rmr-lamp.right { right: 8%; }
        .rmr-counter {
          position: absolute; z-index: 3; top: 44%; left: 50%; width: 57%; min-width: 270px;
          transform: translateX(-50%); padding: 10px 12px 13px; text-align: center;
          border: 2px solid #a96b48; border-radius: 8px;
          background: linear-gradient(180deg, #a56345, #734636);
          box-shadow: 0 11px 0 rgba(25,24,23,.3), 0 0 35px rgba(244,177,93,.13);
        }
        .rmr-counter::before { content: ""; position: absolute; top: -8px; left: 3%; right: 3%; height: 9px; border-radius: 5px 5px 1px 1px; background: #d39a66; }
        .rmr-counter-label { display: flex; justify-content: center; align-items: center; gap: 6px; color: rgba(255,239,209,.72); font-size: 8px; font-weight: 900; letter-spacing: .16em; }
        .rmr-counter strong { display: block; margin-top: 3px; color: #fff0d0; font-family: "Space Grotesk", sans-serif; font-size: 15px; letter-spacing: .15em; }
        .rmr-bowl-line { display: flex; justify-content: center; gap: 8px; margin: -1px auto 0; }
        .rmr-bowl { position: relative; width: 26px; height: 13px; border: 1.5px solid #e9c68e; border-top: 2px solid #f0d9ae; border-radius: 2px 2px 12px 12px; background: #f4e5c8; }
        .rmr-bowl::before { content: ""; position: absolute; left: 5px; top: 3px; width: 14px; height: 2px; border-radius: 10px; background: #d98251; }
        .rmr-floor {
          position: absolute; inset: 59% 0 0; overflow: hidden;
          background:
            linear-gradient(90deg, rgba(255,228,186,.08) 1px, transparent 1px) 0 0/50px 50px,
            linear-gradient(rgba(47,31,26,.14) 1px, transparent 1px) 0 0/50px 50px,
            linear-gradient(135deg, #8c694e, #a27b58 49%, #755342);
          box-shadow: inset 0 19px 22px rgba(28,24,22,.27);
        }
        .rmr-floor-glow { position: absolute; z-index: 2; inset: 47% 18% -30%; background: radial-gradient(ellipse, rgba(255,212,135,.19), transparent 66%); pointer-events: none; }
        .rmr-table {
          position: absolute; z-index: 4; top: 22%; width: 83px; height: 49px; border-radius: 48% 48% 9px 9px;
          background: linear-gradient(180deg, #d49c66, #a96d47); box-shadow: 0 9px 0 #62473b, 0 16px 17px rgba(25,22,19,.27);
        }
        .rmr-table::before { content: ""; position: absolute; left: 15px; right: 15px; bottom: -21px; height: 22px; border-left: 4px solid #574139; border-right: 4px solid #574139; }
        .rmr-table.one { left: 18%; transform: scale(.82); }
        .rmr-table.two { right: 18%; top: 35%; transform: scale(.9); }
        .rmr-stool {
          position: absolute; z-index: 3; width: 36px; height: 25px; border-radius: 8px 8px 3px 3px;
          background: linear-gradient(145deg, #55776c, #35534d); box-shadow: 0 5px 0 #283c38, 0 9px 10px rgba(25,22,19,.2);
        }
        .rmr-stool::after { content: ""; position: absolute; top: 22px; left: 7px; width: 4px; height: 15px; background: #35413b; box-shadow: 18px 0 #35413b; }
        .rmr-stool.a { left: 13%; top: 35%; }
        .rmr-stool.b { left: 25%; top: 35%; }
        .rmr-stool.c { right: 12%; top: 45%; }
        .rmr-stool.d { right: 24%; top: 45%; }
        .rmr-plant {
          position: absolute; z-index: 4; bottom: 2%; width: 48px; height: 58px;
          border-radius: 55% 45% 4px 4px; background: radial-gradient(ellipse at 30% 30%, #84aa7c 0 16%, transparent 18%), radial-gradient(ellipse at 67% 26%, #6f9670 0 16%, transparent 18%), radial-gradient(ellipse at 49% 51%, #91b077 0 18%, transparent 20%), linear-gradient(90deg, transparent 43%, #718658 44% 56%, transparent 57%);
          filter: drop-shadow(0 5px 3px rgba(29,24,21,.22));
        }
        .rmr-plant::after { content: ""; position: absolute; left: 7px; right: 7px; bottom: 0; height: 20px; border-radius: 2px 2px 7px 7px; background: #bd8054; }
        .rmr-plant.left { left: 4%; }
        .rmr-plant.right { right: 4%; transform: scaleX(-1); }
        .rmr-door {
          position: absolute; z-index: 5; right: 5%; bottom: 0; width: 63px; height: 88px;
          display: flex; align-items: flex-end; justify-content: center; padding-bottom: 7px;
          border: 4px solid #433a36; border-bottom: 0; border-radius: 25px 25px 0 0;
          color: #d4e5ce; background: linear-gradient(180deg, rgba(98,141,129,.82), rgba(48,84,76,.96));
          box-shadow: inset 0 0 17px rgba(210,238,208,.11), 0 0 18px rgba(117,202,178,.12);
          font-size: 7px; font-weight: 900; letter-spacing: .1em;
        }
        .rmr-room-chip {
          position: absolute; z-index: 6; top: 12px; left: 12px; display: flex; align-items: center; gap: 6px;
          padding: 6px 9px; color: #f6ecd7; border: 1px solid rgba(255,255,255,.16); border-radius: 999px;
          background: rgba(34,48,45,.62); backdrop-filter: blur(8px); font-size: 8px; font-weight: 900; letter-spacing: .1em;
        }
        .rmr-room-chip i { width: 6px; height: 6px; border-radius: 50%; background: #83d1a4; box-shadow: 0 0 0 3px rgba(131,209,164,.14); }
        .rmr-side { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
        .rmr-side-card { padding: 14px 15px; }
        .rmr-side-kicker { display: flex; align-items: center; gap: 7px; color: #8b806f; font-size: 8px; font-weight: 900; letter-spacing: .15em; }
        .rmr-special {
          position: relative; overflow: hidden; color: #fff5df; border: 0;
          background: linear-gradient(135deg, #bd7752, #87533f);
        }
        .rmr-special::after { content: ""; position: absolute; top: -32px; right: -19px; width: 120px; height: 120px; border: 1px solid rgba(255,240,208,.12); border-radius: 50%; box-shadow: 0 0 0 15px rgba(255,240,208,.04), 0 0 0 30px rgba(255,240,208,.035); }
        .rmr-special .rmr-side-kicker { color: rgba(255,245,223,.74); }
        .rmr-special h3 { position: relative; z-index: 1; margin: 10px 0 4px; font-family: "Space Grotesk", sans-serif; font-size: 17px; letter-spacing: -.035em; }
        .rmr-special p { position: relative; z-index: 1; margin: 0; color: rgba(255,245,223,.75); font-size: 10px; }
        .rmr-special .rmr-multiplier { display: inline-flex; margin-top: 11px; padding: 5px 8px; color: #fff1cf; border: 1px solid rgba(255,255,255,.2); border-radius: 8px; background: rgba(66,43,34,.18); font-size: 9px; font-weight: 800; }
        .rmr-delivery { display: grid; grid-template-columns: 1fr auto; gap: 9px; align-items: center; }
        .rmr-delivery-copy strong { display: block; margin-top: 7px; font-family: "Space Grotesk", sans-serif; font-size: 16px; letter-spacing: -.035em; }
        .rmr-delivery-copy small { display: block; margin-top: 3px; color: #929080; font-size: 9px; }
        .rmr-button {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          min-height: 34px; padding: 0 12px; color: #fff8eb; border: 0; border-radius: 9px;
          background: var(--teal); cursor: pointer; font-size: 10px; font-weight: 900;
          box-shadow: 0 4px 0 #174d48; transition: transform .16s ease, filter .16s ease;
        }
        .rmr-button:hover { transform: translateY(-1px); filter: brightness(1.07); }
        .rmr-button:active { transform: translateY(2px); box-shadow: 0 2px 0 #174d48; }
        .rmr-shift {
          display: grid; grid-template-columns: 1fr auto; gap: 7px; align-items: center; color: #fff3df;
          border: 0; background: linear-gradient(135deg, #56463e, #3c3533);
        }
        .rmr-shift .rmr-side-kicker { color: rgba(255,243,223,.69); }
        .rmr-shift strong { display: block; margin-top: 5px; font-family: "Space Grotesk", sans-serif; font-size: 24px; font-variant-numeric: tabular-nums; letter-spacing: -.055em; }
        .rmr-shift small { display: block; margin-top: 1px; color: rgba(255,243,223,.69); font-size: 9px; }
        .rmr-shift small b { color: #f4d094; }
        .rmr-timer-mark { display: grid; place-items: center; width: 43px; height: 43px; border: 1px solid rgba(246,206,145,.23); border-radius: 50%; color: #f0cb8a; }
        .rmr-risk { grid-column: 1 / -1; margin-top: 1px; color: #e6b885; font-size: 8px; font-weight: 800; }
        .rmr-fever { display: flex; align-items: center; gap: 12px; }
        .rmr-fever-mark { display: grid; place-items: center; width: 39px; height: 39px; flex: 0 0 39px; color: #aa6744; border-radius: 12px; background: #f4e4c8; }
        .rmr-fever-copy { flex: 1; min-width: 0; }
        .rmr-fever-copy strong { display: block; margin-top: 4px; font-size: 13px; }
        .rmr-meter { height: 5px; margin-top: 8px; overflow: hidden; border-radius: 99px; background: #e9e1d2; }
        .rmr-meter span { display: block; width: 0%; height: 100%; border-radius: inherit; background: var(--coral); }
        .rmr-disabled {
          min-height: 30px; padding: 0 9px; color: #a19a8b; border: 1px solid var(--line); border-radius: 8px;
          background: #f0eadd; cursor: not-allowed; font-size: 9px; font-weight: 900;
        }
        .rmr-pantry { margin-top: 15px; padding: 15px 16px 16px; }
        .rmr-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 2px 12px; }
        .rmr-section-heading { display: flex; align-items: center; gap: 9px; }
        .rmr-section-heading > span { display: grid; place-items: center; width: 31px; height: 31px; color: #2b7568; border-radius: 10px; background: #e5ecdc; }
        .rmr-section-heading h2 { margin: 0; font-family: "Space Grotesk", sans-serif; font-size: 14px; letter-spacing: -.035em; }
        .rmr-section-heading p { margin: 3px 0 0; color: #8e8b7e; font-size: 9px; }
        .rmr-stock { display: flex; align-items: center; gap: 6px; color: #628268; font-size: 8px; font-weight: 900; letter-spacing: .12em; }
        .rmr-stock i { width: 6px; height: 6px; border-radius: 50%; background: #7baa71; box-shadow: 0 0 0 3px rgba(123,170,113,.12); }
        .rmr-ingredients { display: grid; grid-template-columns: repeat(8, minmax(108px, 1fr)) minmax(130px, 1.12fr); gap: 7px; overflow-x: auto; padding-bottom: 2px; }
        .rmr-ingredient {
          min-width: 0; padding: 9px; border: 1px solid rgba(92,91,68,.13); border-radius: 11px;
          background: linear-gradient(145deg, #fffaf0, #f0e9da);
        }
        .rmr-ing-top { display: flex; align-items: center; gap: 6px; color: #6e7d72; font-size: 9px; font-weight: 800; white-space: nowrap; }
        .rmr-ing-top svg { color: #a56e48; flex: 0 0 auto; }
        .rmr-ing-amount { margin: 6px 0 7px; color: #354d43; font-family: "Space Grotesk", sans-serif; font-size: 15px; font-weight: 700; }
        .rmr-buy {
          width: 100%; min-height: 27px; padding: 0 5px; color: #2f6f5b; border: 1px solid rgba(59,131,104,.18);
          border-radius: 7px; background: #e2f0e1; cursor: pointer; font-size: 8px; font-weight: 900; white-space: nowrap;
          transition: background .16s ease, transform .16s ease;
        }
        .rmr-buy:hover { transform: translateY(-1px); background: #d2e9d5; }
        .rmr-auto-refill {
          min-width: 130px; display: flex; flex-direction: column; justify-content: space-between;
          border-color: rgba(189,129,63,.2); background: linear-gradient(145deg, #f8ebd4, #efe0c4);
        }
        .rmr-auto-refill .rmr-ing-top svg { color: #9d7040; }
        .rmr-auto-refill .rmr-ing-amount { font-size: 12px; }
        .rmr-auto-refill .rmr-buy { color: #805b2b; border-color: rgba(154,112,54,.2); background: #f5dfb2; }
        .rmr-upgrades { margin-top: 15px; padding: 15px 16px; }
        .rmr-upgrade-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 11px; }
        .rmr-upgrade-header h2 { margin: 0; font-family: "Space Grotesk", sans-serif; font-size: 14px; letter-spacing: -.035em; }
        .rmr-upgrade-header span { color: #948c7d; font-size: 9px; }
        .rmr-upgrade-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 7px; }
        .rmr-upgrade {
          display: flex; align-items: center; justify-content: space-between; gap: 6px; min-height: 47px; padding: 8px 10px;
          color: #5c655a; border: 1px solid rgba(91,91,69,.14); border-radius: 10px; background: #f4eddf;
          cursor: pointer; font-size: 10px; font-weight: 900; transition: background .16s ease, transform .16s ease;
        }
        .rmr-upgrade:hover { transform: translateY(-1px); background: #e9f0df; }
        .rmr-upgrade svg { color: #a2714b; }
        .rmr-bottom-actions { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 8px; margin-top: 10px; }
        .rmr-bottom-actions button { min-height: 38px; padding: 0 12px; border-radius: 9px; cursor: pointer; font-size: 9px; font-weight: 900; transition: transform .16s ease, filter .16s ease; }
        .rmr-bottom-actions button:hover { transform: translateY(-1px); filter: brightness(1.03); }
        .rmr-prestige { color: #624622; border: 1px solid #e6c583; background: #f2d89f; box-shadow: 0 3px 0 #d1aa65; }
        .rmr-market { color: #f5f5e9; border: 1px solid #416b69; background: #477d76; box-shadow: 0 3px 0 #315f5b; }
        .rmr-reset { color: #a75748; border: 1px solid rgba(173,85,66,.24); background: #f8e9df; }
        .rmr-toast {
          position: fixed; z-index: 100; right: 22px; bottom: 20px; display: flex; align-items: center; gap: 9px;
          max-width: calc(100vw - 32px); padding: 12px 15px; color: #fff8eb; border: 1px solid rgba(255,255,255,.18);
          border-radius: 12px; background: #294d47; box-shadow: 0 12px 32px rgba(30,50,44,.22);
          font-size: 11px; font-weight: 800; animation: rmr-toast-in .2s ease-out;
        }
        .rmr-toast svg { color: #a8dbb2; }
        @keyframes rmr-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 980px) {
          .rmr-economy { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .rmr-money { grid-column: 1 / -1; min-height: 65px; }
          .rmr-main { grid-template-columns: minmax(0, 1.3fr) minmax(260px, .8fr); }
          .rmr-ingredients { grid-template-columns: repeat(4, minmax(112px, 1fr)); }
          .rmr-auto-refill { grid-column: span 2; }
        }
        @media (max-width: 720px) {
          .rmr { padding: 15px; }
          .rmr-header { gap: 10px; margin-bottom: 14px; }
          .rmr-mark { width: 47px; height: 47px; flex-basis: 47px; border-radius: 15px 15px 15px 6px; }
          .rmr-brand p { font-size: 10px; }
          .rmr-store-tag { display: none; }
          .rmr-economy { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .rmr-money { grid-column: 1 / -1; }
          .rmr-stat { min-height: 67px; padding: 11px 12px; }
          .rmr-main { grid-template-columns: 1fr; }
          .rmr-scene { height: min(68vw, 460px); min-height: 325px; }
          .rmr-side { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .rmr-special { grid-row: span 2; }
          .rmr-upgrade-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .rmr-bottom-actions { grid-template-columns: 1fr; }
        }
        @media (max-width: 460px) {
          .rmr { padding: 12px; }
          .rmr-live { padding: 7px 8px; font-size: 8px; }
          .rmr-brand h1 { font-size: 20px; }
          .rmr-brand p { max-width: 180px; font-size: 9px; }
          .rmr-stat .rmr-label { font-size: 8px; }
          .rmr-stat strong { font-size: 15px; }
          .rmr-tabs { margin-bottom: 12px; }
          .rmr-tab { padding: 0 10px; font-size: 10px; }
          .rmr-room-card { padding: 8px; }
          .rmr-room-head { align-items: flex-start; }
          .rmr-room-loc { font-size: 9px; }
          .rmr-scene { min-height: 300px; }
          .rmr-window { left: 5%; width: 29%; }
          .rmr-shop-sign { left: 57%; padding: 9px 12px 7px; font-size: 10px; }
          .rmr-counter { width: 72%; min-width: 0; }
          .rmr-table.one { left: 8%; }
          .rmr-table.two { right: 8%; }
          .rmr-side { grid-template-columns: 1fr; }
          .rmr-special { grid-row: auto; }
          .rmr-section-head { align-items: flex-start; }
          .rmr-stock { font-size: 7px; }
          .rmr-ingredients { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .rmr-auto-refill { grid-column: auto; }
          .rmr-upgrade-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rmr *, .rmr *::before, .rmr *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <div className="rmr-shell">
        <header className="rmr-header">
          <div className="rmr-mark" aria-hidden="true"><Soup size={29} strokeWidth={1.7} /></div>
          <div className="rmr-brand">
            <div className="rmr-eyebrow">STEAM · SIGNAL · SOUL</div>
            <h1>RAMEN <span>MONKEY</span></h1>
            <p>Slow-brewed comfort. Built for tomorrow.</p>
          </div>
          <div className="rmr-header-end">
            <span className="rmr-store-tag"><Store size={13} /> STANDARD STORE</span>
            <span className="rmr-live"><i /> LIVE SHIFT</span>
          </div>
        </header>

        <section className="rmr-economy" aria-label="Restaurant status">
          <div className="rmr-money">
            <span className="rmr-label"><CircleDollarSign size={14} /> Wallet</span>
            <strong>$150</strong>
          </div>
          <div className="rmr-stat">
            <span className="rmr-label"><Soup size={13} /> Menu</span>
            <strong>Basic Shoyu</strong><small>$50 per bowl</small>
          </div>
          <div className="rmr-stat">
            <span className="rmr-label"><Star size={13} /> Monkey Money</span>
            <strong>0 <small>· 1× profits</small></strong>
          </div>
          <div className="rmr-stat">
            <span className="rmr-label"><MapPin size={13} /> Turf Bonus</span>
            <strong>1×</strong><small>Current multiplier</small>
          </div>
          <div className="rmr-stat">
            <span className="rmr-label"><Utensils size={13} /> Served · Combo</span>
            <strong>0 <small>· 0</small></strong>
          </div>
          <div className="rmr-stat">
            <span className="rmr-label"><Gauge size={13} /> Level · Popularity</span>
            <strong>Lv. 1 <small>· 50%</small></strong>
          </div>
        </section>

        <nav className="rmr-tabs" aria-label="Restaurant sections">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              className={`rmr-tab${activeTab === name ? ' active' : ''}`}
              key={name}
              onClick={() => {
                setActiveTab(name);
                if (name !== 'Dining') announce(`${name} navigation preview · Dining remains in focus.`);
              }}
              type="button"
            >
              <Icon size={15} strokeWidth={1.9} /> {name}
            </button>
          ))}
        </nav>

        <main>
          <div className="rmr-main">
            <section className="rmr-room-card" aria-label="Dining room">
              <div className="rmr-room-head">
                <div className="rmr-room-title">
                  <span className="rmr-room-title-icon"><Utensils size={16} /></span>
                  <div>
                    <h2>Dining room</h2>
                    <p>Your neighborhood counter is open.</p>
                  </div>
                </div>
                <span className="rmr-room-loc"><MapPin size={13} /> Monkey City</span>
              </div>
              <div className="rmr-scene">
                <div className="rmr-wall">
                  <div className="rmr-window"><i className="rmr-moon" /><i className="rmr-cityline" /></div>
                  <div className="rmr-shop-sign">RAMEN<span>MONKEY</span></div>
                  <i className="rmr-lamp left" /><i className="rmr-lamp right" />
                </div>
                <div className="rmr-counter">
                  <div className="rmr-counter-label"><Soup size={12} /> OPEN KITCHEN</div>
                  <strong>CHEF'S COUNTER</strong>
                  <div className="rmr-bowl-line"><i className="rmr-bowl" /><i className="rmr-bowl" /><i className="rmr-bowl" /></div>
                </div>
                <div className="rmr-floor">
                  <i className="rmr-table one" /><i className="rmr-table two" />
                  <i className="rmr-stool a" /><i className="rmr-stool b" />
                  <i className="rmr-stool c" /><i className="rmr-stool d" />
                  <i className="rmr-plant left" /><i className="rmr-plant right" />
                  <div className="rmr-door">ENTRANCE</div>
                  <i className="rmr-floor-glow" />
                </div>
                <div className="rmr-room-chip"><i /> DINING · STANDARD STORE</div>
              </div>
            </section>

            <aside className="rmr-side" aria-label="Service controls">
              <section className="rmr-side-card rmr-special">
                <div className="rmr-side-kicker"><ChefHat size={13} /> TODAY'S SPECIAL</div>
                <h3>Golden Egg Ramen</h3>
                <p>Eggs taste legendary today · 24h left</p>
                <span className="rmr-multiplier">1.5× special</span>
              </section>

              <section className="rmr-side-card rmr-delivery">
                <div className="rmr-delivery-copy">
                  <div className="rmr-side-kicker"><Truck size={13} /> DELIVERY DISPATCH</div>
                  <strong>0 delivered</strong>
                  <small>Ready for the next order</small>
                </div>
                <button className="rmr-button" type="button" onClick={() => announce('Dispatch Order selected.')}>
                  Dispatch <ArrowUpRight size={13} />
                </button>
              </section>

              <section className="rmr-side-card rmr-shift">
                <div>
                  <div className="rmr-side-kicker"><Clock3 size={13} /> EXTREME SHIFT <b>1</b></div>
                  <strong>03:00</strong>
                  <small>Rent: <b>$425</b> · due at shift end</small>
                </div>
                <div className="rmr-timer-mark"><Clock3 size={20} /></div>
                <div className="rmr-risk">Miss rent and this run resets</div>
              </section>

              <section className="rmr-side-card rmr-fever">
                <span className="rmr-fever-mark"><Flame size={18} /></span>
                <div className="rmr-fever-copy">
                  <div className="rmr-side-kicker">CHEF FEVER</div>
                  <strong>0% charged</strong>
                  <div className="rmr-meter"><span /></div>
                </div>
                <button className="rmr-disabled" type="button" disabled aria-label="Chef Fever unavailable at zero percent">0%</button>
              </section>
            </aside>
          </div>

          <section className="rmr-pantry" aria-label="Fresh ingredients">
            <div className="rmr-section-head">
              <div className="rmr-section-heading">
                <span><ShoppingBasket size={16} /></span>
                <div><h2>Fresh ingredients</h2><p>The stockroom · Buy 10 at a time</p></div>
              </div>
              <div className="rmr-stock"><i /> FRESH STOCK</div>
            </div>
            <div className="rmr-ingredients">
              {ingredients.map((ingredient) => (
                <div className="rmr-ingredient" key={ingredient.name}>
                  <div className="rmr-ing-top"><IngredientMark kind={ingredient.icon} /> {ingredient.name}</div>
                  <div className="rmr-ing-amount">{ingredient.amount} <span>in stock</span></div>
                  <button className="rmr-buy" type="button" onClick={() => announce(`Buy 10 ${ingredient.name} · ${ingredient.price}`)}>
                    Buy 10 · {ingredient.price}
                  </button>
                </div>
              ))}
              <div className="rmr-ingredient rmr-auto-refill">
                <div className="rmr-ing-top"><Truck size={17} /> Auto-Refill</div>
                <div className="rmr-ing-amount">Restock automatically</div>
                <button className="rmr-buy" type="button" onClick={() => announce('Auto-Refill · Buy ($50k)')}>Buy · $50k</button>
              </div>
            </div>
          </section>

          <section className="rmr-upgrades" aria-label="Restaurant upgrades">
            <div className="rmr-upgrade-header">
              <h2>Upgrades</h2>
              <span>Max level 1000</span>
            </div>
            <div className="rmr-upgrade-grid">
              {upgrades.map((name) => (
                <button className="rmr-upgrade" type="button" key={name} onClick={() => announce(`${name} upgrade selected.`)}>
                  <span>{name}</span><ChevronRight size={14} />
                </button>
              ))}
            </div>
            <div className="rmr-bottom-actions">
              <button className="rmr-prestige" type="button" onClick={() => announce('Claim Monkey Money · Requirement: $1 Trillion.')}>
                <Star size={14} /> Claim Monkey Money · Req: $1 Trillion
              </button>
              <button className="rmr-market" type="button" onClick={() => announce('Visit the Black Market selected.')}>
                <Swords size={14} /> Visit the Black Market
              </button>
              <button className="rmr-reset" type="button" onClick={() => setShowReset(true)}>
                <RotateCcw size={14} /> Start Fresh (Save Backup)
              </button>
            </div>
          </section>
        </main>
      </div>

      {notice && <div className="rmr-toast" role="status"><Sparkles size={15} />{notice}</div>}
      {showReset && (
        <div className="rmr-reset-dialog" role="dialog" aria-modal="true" aria-label="Start fresh">
          <div className="rmr-reset-dialog-card">
            <span className="rmr-reset-dialog-icon"><RotateCcw size={19} /></span>
            <h2>Start fresh?</h2>
            <p>This action is shown for the gameplay mockup only. No game data will be changed.</p>
            <div>
              <button type="button" onClick={() => setShowReset(false)}>Keep playing</button>
              <button type="button" onClick={() => { setShowReset(false); announce('Start Fresh action previewed · no game data changed.'); }}>Continue</button>
            </div>
          </div>
          <style>{`
            .rmr-reset-dialog { position: fixed; z-index: 110; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(28,43,39,.43); backdrop-filter: blur(5px); }
            .rmr-reset-dialog-card { width: min(390px, 100%); padding: 24px; border: 1px solid rgba(75,87,67,.18); border-radius: 18px; background: #faf5eb; box-shadow: 0 24px 70px rgba(24,37,33,.24); }
            .rmr-reset-dialog-icon { display: grid; place-items: center; width: 39px; height: 39px; color: #a55f4c; border-radius: 12px; background: #f4e2d8; }
            .rmr-reset-dialog-card h2 { margin: 15px 0 6px; color: #273b37; font: 700 20px "Space Grotesk", sans-serif; letter-spacing: -.04em; }
            .rmr-reset-dialog-card p { margin: 0; color: #75827a; font-size: 12px; line-height: 1.6; }
            .rmr-reset-dialog-card > div { display: flex; gap: 8px; margin-top: 19px; }
            .rmr-reset-dialog-card button { flex: 1; min-height: 38px; border: 1px solid rgba(75,87,67,.16); border-radius: 9px; background: #f0eadd; color: #58665c; cursor: pointer; font-size: 11px; font-weight: 900; }
            .rmr-reset-dialog-card button:last-child { color: #fff8eb; border-color: #276f66; background: #276f66; }
          `}</style>
        </div>
      )}
    </div>
  );
}
