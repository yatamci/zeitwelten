/* Zeitwelten – all clock systems represent the same 86,400 real seconds. */
(() => {
  "use strict";
  const SYSTEMS = {
    standard: { hours: 24, minutes: 60, seconds: 60, dialHours: 12, ticksPerHour: 5 },
    a: { hours: 36, minutes: 60, seconds: 40, dialHours: 12, ticksPerHour: 5 },
    b: { hours: 36, minutes: 48, seconds: 50, dialHours: 12, ticksPerHour: 4 },
    c: { hours: 30, minutes: 60, seconds: 48, dialHours: 10, ticksPerHour: 6 }
  };
  const DAY_SECONDS = 86400;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const pad = n => String(n).padStart(2, "0");

  function fromRealSeconds(realSeconds, system) {
    const total = ((realSeconds % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS;
    const unitsPerDay = system.hours * system.minutes * system.seconds;
    const scaled = total / DAY_SECONDS * unitsPerDay;
    const whole = Math.floor(scaled + 1e-9);
    const h = Math.floor(whole / (system.minutes * system.seconds));
    const m = Math.floor(whole / system.seconds) % system.minutes;
    const s = whole % system.seconds;
    return { h, m, s, fraction: total / DAY_SECONDS };
  }
  function format(t) { return `${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`; }

  function svgEl(name, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
    return el;
  }
  function point(cx, cy, radius, angle) {
    const a = (angle - 90) * Math.PI / 180;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  }
  function drawDial(svg, t, system) {
    const cx = 130, cy = 130, r = 108;
    svg.replaceChildren();
    svg.append(svgEl("circle", {cx,cy,r:116,fill:"none",stroke:"var(--dial-line)","stroke-opacity":".18","stroke-width":"1"}));
    svg.append(svgEl("circle", {cx,cy,r:105,fill:"var(--dial-face)",stroke:"var(--dial-line)","stroke-opacity":".35","stroke-width":"1"}));

    const totalTicks = system.dialHours * system.ticksPerHour;
    for (let i=0; i<totalTicks; i++) {
      const major = i % system.ticksPerHour === 0;
      const angle = i / totalTicks * 360;
      const p1 = point(cx,cy, major ? 94 : 99, angle);
      const p2 = point(cx,cy,  major ? 105 : 103, angle);
      svg.append(svgEl("line",{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:"var(--dial-line)","stroke-width":major?2.4:1.25,"stroke-linecap":"round",opacity:major?1:.75}));
      if (major) {
        const p = point(cx,cy,82,angle);
        const label = svgEl("text",{x:p[0],y:p[1]+4,"text-anchor":"middle",fill:"var(--dial-text)","font-size":"12","font-family":"DM Mono, monospace","font-weight":"500"});
        label.textContent = String(i / system.ticksPerHour || system.dialHours);
        svg.append(label);
      }
    }
    // Minute hand makes one full revolution per system hour; hour hand follows the dial's full-day cycle.
    const minuteFraction = (t.m + t.s / system.seconds) / system.minutes;
    const hourFraction = (t.h + minuteFraction) / system.hours;
    const dialHourFraction = (hourFraction * system.hours) % system.dialHours / system.dialHours;
    const hourAngle = dialHourFraction * 360;
    const minuteAngle = minuteFraction * 360;
    const secondFraction = t.s / system.seconds;
    const secondAngle = secondFraction * 360;

    const hp = point(cx,cy,55,hourAngle), mp = point(cx,cy,79,minuteAngle), sp = point(cx,cy,88,secondAngle);
    svg.append(svgEl("line",{x1:cx,y1:cy,x2:hp[0],y2:hp[1],stroke:"var(--hand)","stroke-width":"6","stroke-linecap":"round"}));
    svg.append(svgEl("line",{x1:cx,y1:cy,x2:mp[0],y2:mp[1],stroke:"var(--accent)","stroke-width":"3.5","stroke-linecap":"round"}));
    svg.append(svgEl("line",{x1:cx,y1:cy,x2:sp[0],y2:sp[1],stroke:"var(--second)","stroke-width":"1.5","stroke-linecap":"round"}));
    svg.append(svgEl("circle",{cx,cy,r:5,fill:"var(--accent)"}));
    svg.append(svgEl("circle",{cx,cy,r:2,fill:"var(--dial-face)"}));
  }
  function renderClock(card, key, realSeconds) {
    const system = SYSTEMS[key], t = fromRealSeconds(realSeconds, system);
    $(".digital-time",card).textContent = format(t);
    drawDial($(".dial",card),t,system);
  }
  function renderConverter(realSeconds) {
    ["a","b","c"].forEach(key => {
      const card = $(`[data-result="${key}"]`);
      const t = fromRealSeconds(realSeconds,SYSTEMS[key]);
      $(".result-digital",card).textContent = format(t);
      drawDial($(".dial",card),t,SYSTEMS[key]);
    });
  }
  function realNowSeconds() {
    const d = new Date();
    return d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds() + d.getMilliseconds()/1000;
  }
  function renderLive() {
    const now = realNowSeconds();
    document.querySelectorAll("[data-clock]").forEach(card => renderClock(card,card.dataset.clock,now));
    if ($("#clocksView").classList.contains("active")) {
      // Keep the converter's values independent from live time unless the user presses "now".
    }
  }
  function setConverterFromInputs() {
    const h = Number($("#inputHours").value), m = Number($("#inputMinutes").value), s = Number($("#inputSeconds").value);
    const error = $("#inputError");
    const valid = Number.isInteger(h)&&Number.isInteger(m)&&Number.isInteger(s)&&h>=0&&h<24&&m>=0&&m<60&&s>=0&&s<60;
    if (!valid) { error.textContent = "Bitte gültige Werte eingeben (00–23 / 00–59 / 00–59)."; return; }
    error.textContent = "";
    renderConverter(h*3600+m*60+s);
  }
  ["inputHours","inputMinutes","inputSeconds"].forEach(id => {
    $("#"+id).addEventListener("input",setConverterFromInputs);
    $("#"+id).addEventListener("change",e => { if(e.target.value!=="") e.target.value=pad(Number(e.target.value)); });
  });
  $("#nowButton").addEventListener("click",() => {
    const d = new Date();
    $("#inputHours").value=pad(d.getHours()); $("#inputMinutes").value=pad(d.getMinutes()); $("#inputSeconds").value=pad(d.getSeconds());
    setConverterFromInputs();
  });
  document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click",() => {
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===btn));
    $("#clocksView").classList.toggle("active",btn.dataset.tab==="clocks");
    $("#converterView").classList.toggle("active",btn.dataset.tab==="converter");
  }));
  const savedTheme = localStorage.getItem("zeitwelten-theme");
  if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";
  function updateThemeIcon() { $("#themeIcon").textContent = document.documentElement.dataset.theme==="dark" ? "☀" : "☾"; }
  $("#themeToggle").addEventListener("click",() => {
    const dark = document.documentElement.dataset.theme !== "dark";
    if(dark) document.documentElement.dataset.theme="dark"; else delete document.documentElement.dataset.theme;
    localStorage.setItem("zeitwelten-theme",dark?"dark":"light");
    updateThemeIcon(); renderLive(); setConverterFromInputs();
  });
  updateThemeIcon();
  renderLive(); setConverterFromInputs();
  setInterval(renderLive,250);
})();