<template>
  <div class="guest-shell">
    <section class="hero-panel">
      <div class="hero-grid" />
      <div class="hero-aura hero-aura-top" />
      <div class="hero-aura hero-aura-bottom" />

      <div class="hero-content">
        <header class="hero-header">
          <NavigationHeaderLogo inverted to="/welcome" />
        </header>

        <div class="hero-copy">
          <h1 class="hero-title">Ket noi voi<br>ban be!</h1>
          <p class="hero-subtitle">
            Chia se nhung dieu moi va nhung khoanh khac dang nho cung cong dong cua ban.
          </p>
        </div>

        <div class="hero-visual">
          <div class="visual-wrap">
            <div class="hub-core">
              <span class="hub-ring outer" />
              <span class="hub-ring inner" />
              <span class="hub-center" />
            </div>

            <div class="beam beam-top" />
            <div class="beam beam-right" />
            <div class="beam beam-left" />

            <div class="glass-node node-top">
              <div class="icon-bubble">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div class="glass-node node-right">
              <div class="icon-gallery">
                <span class="sun" />
                <span class="mountain a" />
                <span class="mountain b" />
              </div>
            </div>

            <div class="glass-node node-left">
              <div class="icon-group">
                <span class="head h1" />
                <span class="head h2" />
                <span class="body b1" />
                <span class="body b2" />
              </div>
            </div>

            <div class="glass-card card-top">
              <div class="card-icon">
                <div class="icon-gallery compact">
                  <span class="sun" />
                  <span class="mountain a" />
                  <span class="mountain b" />
                </div>
              </div>
              <div class="card-lines">
                <span class="line line-long" />
                <span class="line line-short" />
              </div>
              <div class="card-stats">
                <span class="stat rose" />
                <span class="stat pale" />
              </div>
            </div>

            <div class="glass-chip chip-left">
              <span class="chip-heart">♥</span>
            </div>

            <div class="glass-chip chip-right">
              <span class="chip-dot" />
              <span class="chip-dot" />
              <span class="chip-dot" />
            </div>

            <span class="pulse pulse-top" />
            <span class="pulse pulse-right" />
            <span class="pulse pulse-left" />
          </div>
        </div>
      </div>
    </section>

    <section class="form-panel">
      <div class="form-panel-inner">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.guest-shell {
  display: grid;
  grid-template-columns: minmax(0, 0.98fr) minmax(32rem, 1.02fr);
  min-height: 100svh;
  background: linear-gradient(180deg, #f6f8ff 0%, #ffffff 100%);
}

.hero-panel {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.18), transparent 16%),
    radial-gradient(circle at 82% 18%, rgba(158, 188, 255, 0.22), transparent 18%),
    linear-gradient(150deg, #2d4fff 0%, #1738ff 42%, #0f28e2 72%, #0a1fc7 100%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.16) 1px, transparent 1px);
  background-size: 26px 26px;
  opacity: 0.24;
  pointer-events: none;
}

.hero-aura {
  position: absolute;
  border-radius: 9999px;
  filter: blur(28px);
  pointer-events: none;
}

.hero-aura-top {
  top: -4rem;
  left: -3rem;
  width: 15rem;
  height: 15rem;
  background: rgba(255, 255, 255, 0.2);
}

.hero-aura-bottom {
  right: -4rem;
  bottom: -4rem;
  width: 16rem;
  height: 16rem;
  background: rgba(132, 163, 255, 0.2);
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 2.75rem;
}

.hero-header {
  flex-shrink: 0;
}

.hero-copy {
  margin-top: 2.5rem;
  max-width: 20rem;
  color: #fff;
}

.hero-title {
  margin: 0;
  font-size: clamp(2.2rem, 3.6vw, 4.3rem);
  line-height: 0.95;
  letter-spacing: -0.065em;
  font-weight: 900;
}

.hero-subtitle {
  margin: 1.2rem 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.96rem;
  line-height: 1.7;
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
}

.visual-wrap {
  position: relative;
  width: min(100%, 31rem);
  height: min(100%, 23rem);
}

.hub-core {
  position: absolute;
  left: 50%;
  top: 60%;
  transform: translate(-50%, -50%);
  width: 9rem;
  height: 9rem;
}

.hub-ring {
  position: absolute;
  border-radius: 9999px;
}

.hub-ring.outer {
  inset: 0;
  background: rgba(255, 255, 255, 0.06);
  border: 1px dashed rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 40px rgba(7, 18, 100, 0.2);
}

.hub-ring.inner {
  inset: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.34);
}

.hub-center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1.35rem;
  height: 1.35rem;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 0 0 0.72rem rgba(255, 255, 255, 0.12);
}

.hub-center::after {
  content: "";
  position: absolute;
  inset: 0.38rem;
  border-radius: 9999px;
  background: #0000ff;
}

.beam {
  position: absolute;
  border-top: 2px dashed rgba(255, 255, 255, 0.34);
  transform-origin: left center;
  animation: dash-flow 2.8s linear infinite;
}

.beam-top {
  left: 50%;
  top: 30%;
  width: 0;
  height: 4rem;
  border-top: 0;
  border-left: 2px dashed rgba(255, 255, 255, 0.34);
  transform: translateX(-50%);
}

.beam-right {
  left: 58%;
  top: 59%;
  width: 7rem;
}

.beam-left {
  left: 20%;
  top: 73%;
  width: 8.5rem;
  transform: rotate(-24deg);
}

.glass-node,
.glass-card,
.glass-chip {
  position: absolute;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 18px 42px rgba(12, 24, 110, 0.18);
  backdrop-filter: blur(16px);
}

.glass-node {
  width: 4.9rem;
  height: 4.9rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 4.4s ease-in-out infinite;
}

.node-top {
  left: 50%;
  top: 13%;
  transform: translateX(-50%);
}

.node-right {
  right: 1.6rem;
  top: 45%;
  animation-delay: 0.8s;
}

.node-left {
  left: 1.4rem;
  bottom: 1.2rem;
  animation-delay: 1.5s;
}

.glass-card {
  top: 1.2rem;
  right: 2.2rem;
  width: 8.6rem;
  height: 5.8rem;
  border-radius: 1.7rem;
  padding: 0.9rem;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 0.6rem 0.8rem;
  animation: float 5.1s ease-in-out infinite;
}

.card-icon {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 255, 0.92);
}

.card-lines {
  display: grid;
  align-content: center;
  gap: 0.35rem;
}

.line {
  display: block;
  height: 0.44rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.44);
}

.line-long { width: 3.6rem; }
.line-short { width: 2.55rem; opacity: 0.8; }

.card-stats {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.9rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 999px;
}

.rose { background: #ff5f84; }
.pale { background: rgba(255, 255, 255, 0.6); }

.glass-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3.9s ease-in-out infinite;
}

.chip-left {
  left: 0.4rem;
  top: 4.9rem;
  width: 4.1rem;
  height: 2.05rem;
  border-radius: 999px;
}

.chip-right {
  right: 0.8rem;
  bottom: 1rem;
  width: 4.6rem;
  height: 2.05rem;
  border-radius: 1.1rem;
  gap: 0.42rem;
  animation-delay: 0.5s;
}

.chip-heart {
  color: #ff5f84;
  font-size: 1rem;
  line-height: 1;
}

.chip-dot {
  width: 0.44rem;
  height: 0.44rem;
  border-radius: 999px;
  background: #ffffff;
}

.pulse {
  position: absolute;
  width: 0.82rem;
  height: 0.82rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 0 0 0.5rem rgba(255, 255, 255, 0.12);
  animation: pulse 2.2s ease-in-out infinite;
}

.pulse-top {
  left: 50%;
  top: 30%;
  transform: translateX(-50%);
}

.pulse-right {
  right: 7.9rem;
  top: 58%;
  animation-delay: 0.45s;
}

.pulse-left {
  left: 6.3rem;
  bottom: 3rem;
  animation-delay: 0.9s;
}

.icon-bubble,
.icon-gallery,
.icon-group {
  position: relative;
  width: 2.2rem;
  height: 2.2rem;
}

.icon-bubble {
  background: rgba(0, 0, 255, 0.96);
  border-radius: 0.82rem;
}

.icon-bubble::after {
  content: "";
  position: absolute;
  left: 0.48rem;
  bottom: -0.3rem;
  width: 0.68rem;
  height: 0.68rem;
  background: rgba(0, 0, 255, 0.96);
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.icon-bubble span {
  position: absolute;
  top: 0.94rem;
  width: 0.22rem;
  height: 0.22rem;
  border-radius: 999px;
  background: #ffffff;
}

.icon-bubble span:nth-child(1) { left: 0.6rem; }
.icon-bubble span:nth-child(2) { left: 0.98rem; }
.icon-bubble span:nth-child(3) { left: 1.36rem; }

.icon-gallery {
  background: rgba(0, 0, 255, 0.96);
  border-radius: 0.75rem;
  overflow: hidden;
}

.icon-gallery .sun {
  position: absolute;
  top: 0.42rem;
  left: 0.45rem;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 999px;
  background: #ffffff;
}

.mountain {
  position: absolute;
  bottom: 0.36rem;
  border-left: 0.7rem solid transparent;
  border-right: 0.7rem solid transparent;
  border-bottom: 0.88rem solid #ffffff;
}

.mountain.a { left: 0.27rem; }
.mountain.b { left: 1rem; border-bottom-width: 1rem; }

.icon-gallery.compact {
  width: 1rem;
  height: 1rem;
}

.icon-gallery.compact .sun {
  top: 0.19rem;
  left: 0.18rem;
  width: 0.14rem;
  height: 0.14rem;
}

.icon-gallery.compact .mountain {
  bottom: 0.15rem;
  border-left-width: 0.23rem;
  border-right-width: 0.23rem;
  border-bottom-width: 0.34rem;
}

.icon-gallery.compact .mountain.a { left: 0.11rem; }
.icon-gallery.compact .mountain.b { left: 0.39rem; border-bottom-width: 0.41rem; }

.icon-group .head,
.icon-group .body {
  position: absolute;
}

.icon-group .head {
  width: 0.52rem;
  height: 0.52rem;
  border-radius: 999px;
  background: rgba(0, 0, 255, 0.96);
  top: 0.45rem;
}

.icon-group .h1 { left: 0.46rem; }
.icon-group .h2 { left: 1.17rem; }

.icon-group .body {
  width: 0.92rem;
  height: 0.52rem;
  top: 1.25rem;
  border-bottom: 2px solid rgba(0, 0, 255, 0.96);
  border-radius: 0 0 1rem 1rem;
}

.icon-group .b1 { left: 0.22rem; }
.icon-group .b2 { left: 0.94rem; }

.form-panel {
  position: relative;
  min-height: 100svh;
  background: #ffffff;
}

.form-panel::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 1px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.05), rgba(15, 23, 42, 0.02));
}

.form-panel-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 2.15rem 3rem;
  background: #ffffff;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.72; }
  50% { transform: scale(1.28); opacity: 1; }
}

@keyframes dash-flow {
  to { stroke-dashoffset: -18; }
}

@media (max-width: 920px) {
  .guest-shell {
    grid-template-columns: 1fr;
    min-height: 100svh;
    max-height: none;
  }

  .hero-panel {
    min-height: 28rem;
  }

  .hero-content {
    padding: 1.6rem;
  }

  .hero-copy {
    margin-top: 2rem;
  }

  .hero-visual {
    min-height: 20rem;
  }

  .form-panel-inner {
    padding: 2rem 1.5rem;
  }
}
</style>
