
  let messages = [];
  let showAll = false;

  const messageContainer = document.getElementById("messageContainer");

  function showCurrentTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById("currentTime").innerText = `Current Time: ${timeStr}`;
  }

  function parseTimeTo24hr(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") hours = parseInt(hours) + 12;
    if (modifier === "AM" && hours === "12") hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  function getUpcomingMessages() {
    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourLaterStr = `${oneHourLater.getHours().toString().padStart(2, '0')}:${oneHourLater.getMinutes().toString().padStart(2, '0')}`;

    const todaysMsgs = messages
      .filter(msg => msg.day.toLowerCase() === currentDay)
      .map(msg => ({ ...msg, parsedTime: parseTimeTo24hr(msg.time) }))
      .sort((a, b) => a.parsedTime.localeCompare(b.parsedTime));

    if (showAll) {
      return todaysMsgs.filter(msg => msg.parsedTime > currentTime);
    }

    return todaysMsgs.filter(msg => msg.parsedTime > currentTime && msg.parsedTime <= oneHourLaterStr);
  }

  function renderMessages(msgs) {
    messageContainer.innerHTML = "";
    if (!msgs || msgs.length === 0) {
      messageContainer.innerHTML = '<p class="text-center text-gray-500">No upcoming messages in the next hour.</p>';
      return;
    }

    msgs.forEach(msg => {
      const card = document.createElement("div");
      card.className = "relative card-wrapper bg-white p-6 rounded-2xl shadow-2xl border border-gray-200 hover:shadow-yellow-300 transition duration-300";

      card.innerHTML = `
        <div class="text-3xl font-extrabold text-blue-700 mb-3 text-center">${msg["community name"] || ""}</div>
        <div class="text-sm text-gray-500 mb-1 text-center">${msg.time} | <span class="font-semibold text-indigo-600">${msg.sentBy || "Esromagica"}</span> | ${msg.day.toUpperCase()}</div>
        <div class="text-lg font-medium mb-3 text-gray-800 whitespace-pre-line text-center">${msg.message}</div>
        <div class="text-center">
          <button class="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-indigo-600 shadow-md" onclick="copyMessage(\`${msg.message.replace(/`/g, "\\`")}\`)">Copy</button>
        </div>
        ${msg.photo ? `<div class='mt-4 text-center'><img src="${msg.photo}" class="rounded-xl w-40 h-40 object-cover inline-block shadow-md" /></div>` : ""}
        <button class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 next-btn shadow-md hover:bg-gray-100" onclick="toggleMore()">➡️</button>
      `;

      messageContainer.appendChild(card);
    });

    // Append "Read More" button
    if (!showAll) {
      const readMoreBtn = document.createElement("div");
      readMoreBtn.className = "text-center mt-4";
      readMoreBtn.innerHTML = `<button class="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-6 py-2 rounded-full shadow-md" onclick="toggleMore()">Read More ➕</button>`;
      messageContainer.appendChild(readMoreBtn);
    }
  }

  function toggleMore() {
    showAll = !showAll;
    renderMessages(getUpcomingMessages());
  }

  function copyMessage(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied:", text);
    });
  }

  async function loadMessages() {
    try {
      const response = await fetch("messages.json");
      messages = await response.json();
      renderMessages(getUpcomingMessages());
    } catch (error) {
      console.error("Failed to load messages:", error);
      messageContainer.innerHTML = '<p class="text-center text-red-500">Failed to load messages.</p>';
    }
  }

  showCurrentTime();
  setInterval(showCurrentTime, 60000);
  loadMessages();
  setInterval(loadMessages, 60000);
