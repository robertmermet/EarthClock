window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);

    const canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d'),
          earthImg = new Image();

    let daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        radius;

    earthImg.src = './Earth.svg';
    document.body.appendChild(canvas);
    window.addEventListener('resize', resize);
    resize();

    (function updateClock() {
        requestAnimationFrame(updateClock);
        drawEarth();
        drawSun();
    })();

    function resize() {
        radius = getCircleRadius(20);
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        ctx.translate(canvas.width / 2, canvas.height / 2);
    }

    function getCircleRadius(padding) {
        if (window.innerWidth < window.innerHeight) {
            return Math.round((window.innerWidth / 2) - padding);
        } else {
            return Math.round((window.innerHeight / 2) - padding);
        }
    }

    function drawEarth() {
        // Clear canvas
        ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
        // Draw sea
        ctx.fillStyle = '#0078f8';
        ctx.lineWidth = radius * .005;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();
        // Draw land
        ctx.drawImage(earthImg, -radius, -radius, radius * 2, radius * 2);
        // Draw Tropic of Cancer
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = radius * .002;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(0, 0, .37 * radius, 0, 2 * Math.PI);
        ctx.stroke();
        // Draw Tropic of Capricorn
        ctx.beginPath();
        ctx.arc(0, 0, .63 * radius, 0, 2 * Math.PI);
        ctx.stroke();
        // Draw latitude lines
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 12; i++) {
            if (i == 6) {
                ctx.strokeStyle = '#ff0000'; // Equator
            } else {
                ctx.strokeStyle = '#ccc';
            }
            ctx.beginPath();
            ctx.arc(0, 0, 1 / 12 * i * radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        // Draw longitude lines
        for (let i = 0; i < 24; i++) {
            if (i == 0) {
                ctx.strokeStyle = '#ff0000'; // Prime meridian
            } else {
                ctx.strokeStyle = '#ccc';
            }
            ctx.beginPath();
            ctx.moveTo(!(i % 2) ? .005 * radius : 1 / 12 * 2 * radius, 0);
            ctx.lineTo(radius, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / 12);
        }
    }

    function drawSun() {
        const date = new Date(),
              angle = (180 * Math.PI / 180) +
                      (date.getUTCHours() * Math.PI / 12) +
                      (date.getUTCMinutes() * Math.PI / (12 * 60)) +
                      (date.getUTCSeconds() * Math.PI / (720 * 60));
        ctx.fillStyle = '#f8b800';
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.beginPath();
        ctx.rotate(angle);
        ctx.arc(getSunPos(date) * radius, 0, .04 * radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }

    function getSunPos(date) {
        const month = date.getUTCMonth(),
              day = date.getUTCDate();
        let leapYear = false,
            offset;
        if (isLeapYear(date.getUTCFullYear())) {
            daysPerMonth[1] = 29;
            leapYear = true;
        }
        if (month == 5) { // June
            if (day == 21) { // Summer solstice
                offset = .37;
            } else if (day < 21) {
                // Sun northward
                offset = (21 - day) / (leapYear ? 183 : 182) * .26 + .37;
            } else {
                // Sun southward
                offset = (day - 21) / 183 * .26 + .37;
            }
        } else if (month == 11) { // December
            if (day == 21) { // Winter solstice
                offset = .63;
            } else if (day < 21) {
                // Sun southward
                offset = .63 - ((21 - day) / 183 * .26);
            } else {
                // Sun northward
                offset = .63 - ((day - 21) / (isLeapYear(date.getUTCFullYear() + 1) ? 183 : 182) * .26);
            }
        } else if (month < 5) { // January to May
            // Sun northward
            let days = 10;
            for (let i = 0; i < month; i++) {
                days += daysPerMonth[i];
            }
            days += day;
            offset = .63 - (days / (leapYear ? 183 : 182) * .26);
        } else { // July to November
            // Sun southward
            let days = 9;
            for (let i = 6; i < month; i++) {
                days += daysPerMonth[i];
            }
            days += day;
            offset = days / 183 * .26 + .37;
        }
        return offset;
    }

    function isLeapYear(year) {
        return (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) ? true : false;
    }

}, true);