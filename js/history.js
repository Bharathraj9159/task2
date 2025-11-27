
  // 1) animate KPI numbers (simple count up)
  function runKpiCounts() {
    document.querySelectorAll('.kpi-value').forEach(el => {
      const raw = el.getAttribute('data-target') || '0';
      // support decimal like 3.8
      const isFloat = raw.includes('.');
      const target = isFloat ? parseFloat(raw) : parseInt(raw,10);
      const duration = 900;
      let start = 0;
      const step = Math.max(1, Math.floor((isFloat ? target*10 : target) / (duration/16)));
      const timer = setInterval(() => {
        start += step;
        if (isFloat) {
          const show = Math.min(target, start/10).toFixed(1);
          el.textContent = show;
        } else {
          el.textContent = Math.min(target, start);
        }
        if ((!isFloat && start >= target) || (isFloat && (start/10) >= target)) {
          clearInterval(timer);
        }
      }, 16);
    });
  }

  // 2) draw sparkline and animate progress bars
  function revealAnalytics() {
    // draw sparkline
    document.querySelectorAll('.sparkline').forEach(line => line.classList.add('draw'));
    // set progress widths
    document.querySelectorAll('.progress').forEach(p => {
      const val = p.getAttribute('data-progress') || '0';
      p.style.width = val + '%';
    });
  }

  // 3) small intersection observer for when section is visible
  (function initObserver(){
    const section = document.querySelector('.unique-section');
    if (!section) return;
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // run animations only once
          runKpiCounts();
          revealAnalytics();
          o.disconnect();
        }
      });
    }, {threshold: 0.18});
    obs.observe(section);
  })();


  const historyData = {
  "2019": {
    text: "Company founded with a mission to deliver modern solutions.",
    stat: 25
  },
  "2020": {
    text: "Launched our first product and acquired strong early clients.",
    stat: 80
  },
  "2021": {
    text: "Scaled to a larger team and expanded our tech stack.",
    stat: 130
  },
  "2022": {
    text: "Introduced automation features; boosted customer growth.",
    stat: 220
  },
  "2023": {
    text: "Crossed 500 clients and moved into global operations.",
    stat: 500
  }
};

const points = document.querySelectorAll(".h-point");
const card = document.getElementById("historyCard");
const hYear = document.getElementById("hYear");
const hContent = document.getElementById("hContent");
const hStat = document.getElementById("hStat");

points.forEach(point => {
  point.addEventListener("click", () => {
    // remove active
    points.forEach(p => p.classList.remove("active"));
    point.classList.add("active");

    const year = point.dataset.year;

    hYear.textContent = year;
    hContent.textContent = historyData[year].text;
    animateStat(historyData[year].stat);

    // re-animate card
    card.style.animation = "none";
    setTimeout(() => card.style.animation = "", 10);
  });
});

// animated counter
function animateStat(target) {
  let value = 0;
  const duration = 600;
  const interval = setInterval(() => {
    value += Math.ceil(target / 25);
    if (value >= target) {
      value = target;
      clearInterval(interval);
    }
    hStat.textContent = value;
  }, duration / 25);
}
