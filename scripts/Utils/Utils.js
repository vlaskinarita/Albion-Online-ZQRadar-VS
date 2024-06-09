import { PlayersDrawing } from "../Drawings/PlayersDrawing.js";
import { HarvestablesDrawing } from "../Drawings/HarvestablesDrawing.js";
import { MobsDrawing } from "../Drawings/MobsDrawing.js";
import { ChestsDrawing } from "../Drawings/ChestsDrawing.js";
import { DungeonsDrawing } from "../Drawings/DungeonsDrawing.js";
import { MapDrawing } from "../Drawings/MapsDrawing.js";
import { WispCageDrawing } from "../Drawings/WispCageDrawing.js";
import { FishingDrawing } from "../Drawings/FishingDrawing.js";

import { TrackFootprintsDrawing } from "../Drawings/TrackFootprintsDrawing.js";
import { EventCodes } from "./EventCodes.js";

import { PlayersHandler } from "../Handlers/PlayersHandler.js";
import { MobsHandler } from "../Handlers/MobsHandler.js";
import { WispCageHandler } from "../Handlers/WispCageHandler.js";
import { FishingHandler } from "../Handlers/FishingHandler.js";
import { TrackFootprintsHandler } from "../Handlers/TrackFootprintsHandler.js";

import { GetMobList } from "../../mob-info/MobsInfo.js";

var canvasMap = document.getElementById("mapCanvas");
var contextMap = canvasMap.getContext("2d");

var canvasGrid = document.getElementById("gridCanvas");
var contextGrid = canvasGrid.getContext("2d");

var canvas = document.getElementById("drawCanvas");
var context = canvas.getContext("2d");

var canvasOurPlayer = document.getElementById("ourPlayerCanvas");
var contextOurPlayer = canvasOurPlayer.getContext("2d");

var canvasItems = document.getElementById("playersCanvas");
var contextItems = canvasItems.getContext("2d");

const settings = new Settings();

const harvestablesDrawing = new HarvestablesDrawing(settings);
const dungeonsHandler = new DungeonsHandler(settings);

var itemsInfo = new ItemsInfo();

itemsInfo.initItems();

var map = new MapH(-1);
const mapsDrawing = new MapDrawing(settings);

const chestsHandler = new ChestsHandler();
const mobsHandler = new MobsHandler(settings);
mobsHandler.updateMobInfo(await GetMobList());

const harvestablesHandler = new HarvestablesHandler(settings);
const playersHandler = new PlayersHandler(settings);

const wispCageHandler = new WispCageHandler(settings);
const wispCageDrawing = new WispCageDrawing(settings);

const fishingHandler = new FishingHandler(settings);
const fishingDrawing = new FishingDrawing(settings);

const chestsDrawing = new ChestsDrawing(settings);
const mobsDrawing = new MobsDrawing(settings);
const playersDrawing = new PlayersDrawing(settings);
const dungeonsDrawing = new DungeonsDrawing(settings);
const trackFootprintsHandler = new TrackFootprintsHandler(settings);
const trackFootprintsDrawing = new TrackFootprintsDrawing(settings);
playersDrawing.updateItemsInfo(itemsInfo.iteminfo);

let lpX = 0.0;
let lpY = 0.0;

const drawingUtils = new DrawingUtils();
drawingUtils.initCanvas(canvas, context);
drawingUtils.initGridCanvas(canvasGrid, contextGrid);
drawingUtils.InitOurPlayerCanvas(canvasOurPlayer, contextOurPlayer);

const socket = new WebSocket("ws://localhost:5002");

socket.addEventListener("open", (event) => {
  console.log("Connected to the WebSocket server.");
});

socket.addEventListener("message", (event) => {
  var data = JSON.parse(event.data);

  // Extract the string and dictionary from the object
  var extractedString = data.code;

  var extractedDictionary = JSON.parse(data.dictionary);

  switch (extractedString) {
    case "request":
      onRequest(extractedDictionary["parameters"]);
      break;

    case "event":
      onEvent(extractedDictionary["parameters"]);
      break;

    case "response":
      onResponse(extractedDictionary["parameters"]);
      break;
  }
});

function onEvent(Parameters) {
  const id = parseInt(Parameters[0]);
  const eventCode = Parameters[252];

  switch (eventCode) {
    case EventCodes.Track:
      const trackPosX = Parameters[1][0];
      const trackPosY = Parameters[1][1];
      const name = Parameters[3];
      trackFootprintsHandler.addFootprint(id, trackPosX, trackPosY, name);
      break;

    case EventCodes.Leave:
      playersHandler.removePlayer(id);
      mobsHandler.removeMist(id);
      mobsHandler.removeMob(id);
      dungeonsHandler.RemoveDungeon(id);
      chestsHandler.removeChest(id);
      fishingHandler.RemoveFish(id);
      trackFootprintsHandler.removeFootprint(id);
      break;

    case EventCodes.Move:
      const posX = Parameters[4];
      const posY = Parameters[5];
      playersHandler.updatePlayerPosition(id, posX, posY);
      mobsHandler.updateMistPosition(id, posX, posY);
      mobsHandler.updateMobPosition(id, posX, posY);
      trackFootprintsHandler.updateFootprintPosition(id, posX, posY);
      break;

    case EventCodes.NewCharacter:
      playersHandler.handleNewPlayerEvent(Parameters);
      break;

    case EventCodes.NewSimpleHarvestableObjectList:
      harvestablesHandler.newSimpleHarvestableObject(Parameters);
      break;

    case EventCodes.NewHarvestableObject:
      harvestablesHandler.newHarvestableObject(id, Parameters);
      break;

    case EventCodes.HarvestableChangeState:
      harvestablesHandler.HarvestUpdateEvent(Parameters);
      break;

    case EventCodes.HarvestFinished:
      harvestablesHandler.harvestFinished(Parameters);
      break;

    case EventCodes.MobChangeState:
      mobsHandler.updateEnchantEvent(Parameters);
      break;

    case EventCodes.RegenerationHealthChanged:
      playersHandler.UpdatePlayerHealth(Parameters);
      break;

    case EventCodes.CharacterEquipmentChanged:
      playersHandler.updateItems(id, Parameters);
      break;

    case EventCodes.NewMob:
      mobsHandler.NewMobEvent(Parameters);
      break;

    case EventCodes.Mounted:
      playersHandler.handleMountedPlayerEvent(id, Parameters);
      break;

    case EventCodes.NewRandomDungeonExit:
      dungeonsHandler.dungeonEvent(Parameters);
      break;

    case EventCodes.NewLootChest:
      chestsHandler.addChestEvent(Parameters);
      break;

    case EventCodes.NewMistsCagedWisp:
      wispCageHandler.NewCageEvent(Parameters);
      break;

    case EventCodes.MistsWispCageOpened:
      wispCageHandler.CageOpenedEvent(Parameters);
      break;

    // TODO
    case EventCodes.NewFishingZoneObject:
      fishingHandler.NewFishEvent(Parameters);
      break;

    // TODO
    case EventCodes.FishingFinished:
      fishingHandler.FishingEnd(Parameters);
      break;

    default:
      break;
  }
}

function onRequest(Parameters) {
  // Player moving
  if (Parameters[253] == 21) {
    lpX = Parameters[1][0];
    lpY = Parameters[1][1];

    //console.log("X: " + lpX + ", Y: " + lpY);
  }
}

function onResponse(Parameters) {
  // Player join new map
  if (Parameters[253] == 35) {
    map.id = Parameters[0];
  }
  // All data on the player joining the map (us)
  else if (Parameters[253] == 2) {
    lpX = Parameters[9][0];
    lpY = Parameters[9][1];
  }
}

requestAnimationFrame(gameLoop);

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  contextMap.clearRect(0, 0, canvasMap.width, canvasMap.height);

  mapsDrawing.Draw(contextMap, map);

  harvestablesDrawing.invalidate(context, harvestablesHandler.harvestableList);

  mobsDrawing.invalidate(context, mobsHandler.mobsList, mobsHandler.mistList);
  chestsDrawing.invalidate(context, chestsHandler.chestsList);
  wispCageDrawing.Draw(context, wispCageHandler.cages);
  fishingDrawing.Draw(context, fishingHandler.fishes);
  dungeonsDrawing.Draw(context, dungeonsHandler.dungeonList);
  playersDrawing.invalidate(context, playersHandler.playersInRange);
  trackFootprintsDrawing.invalidate(
    context,
    trackFootprintsHandler.getFootprintsList(),
  );
}

var previousTime = performance.now();

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

function update() {
  const currentTime = performance.now();
  const deltaTime = currentTime - previousTime;
  const t = Math.min(1, deltaTime / 100);

  if (settings.showMapBackground) mapsDrawing.interpolate(map, lpX, lpY, t);

  harvestablesHandler.removeNotInRange(lpX, lpY);
  harvestablesDrawing.interpolate(
    harvestablesHandler.harvestableList,
    lpX,
    lpY,
    t,
  );

  mobsDrawing.interpolate(
    mobsHandler.mobsList,
    mobsHandler.mistList,
    lpX,
    lpY,
    t,
  );

  chestsDrawing.interpolate(chestsHandler.chestsList, lpX, lpY, t);
  wispCageHandler.removeNotInRange(lpX, lpY);
  wispCageDrawing.Interpolate(wispCageHandler.cages, lpX, lpY, t);
  fishingDrawing.Interpolate(fishingHandler.fishes, lpX, lpY, t);
  dungeonsDrawing.interpolate(dungeonsHandler.dungeonList, lpX, lpY, t);
  playersDrawing.interpolate(playersHandler.playersInRange, lpX, lpY, t);
  trackFootprintsDrawing.interpolate(
    trackFootprintsHandler.getFootprintsList(),
    lpX,
    lpY,
    t,
  );

  previousTime = currentTime;
}

function drawItems() {
  contextItems.clearRect(0, 0, canvasItems.width, canvasItems.height);

  if (settings.settingItems) {
    playersDrawing.drawItems(
      contextItems,
      canvasItems,
      playersHandler.playersInRange,
      settings.settingItemsDev,
    );
  }
}
const intervalItems = 500;
setInterval(drawItems, intervalItems);

function checkLocalStorage() {
  settings.update(settings);
  setDrawingViews();
}

const interval = 300;
setInterval(checkLocalStorage, interval);

document.getElementById("button").addEventListener("click", function () {
  chestsHandler.chestsList = [];
  dungeonsHandler.dungeonList = [];
  harvestablesHandler.harvestableList = [];
  mobsHandler.mobsList = [];
  mobsHandler.mistList = [];
  playersHandler.playersInRange = [];
  wispCageHandler.cages = [];
});

// Only the relevant modifications are shown here

// Assume that playersDrawingInstance is an instance of the PlayersDrawing class
const playersDrawingInstance = new PlayersDrawing(Settings);

// SONAR CODE
let sonarEnabled = false;
let sonarTimeout;

function playBeep() {
  console.log("Playing beep sound...");
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = 440; // A lower frequency for a softer beep

  // Get volume from the slider (converted from 0-100 to 0.0-1.0 range)
  const volume = document.getElementById("volumeSlider").value / 100;
  gain.gain.value = volume;

  oscillator.start(0);
  gain.gain.exponentialRampToValueAtTime(
    0.00001,
    context.currentTime + 0.3, // Set the beep duration to 0.3 seconds
  );

  oscillator.stop(context.currentTime + 0.3);
}

function calculateSonarInterval(distance) {
  const minInterval = 50; // Minimum interval in milliseconds for constant beep when very close
  const maxInterval = 2000; // Maximum interval in milliseconds for very slow beeping when far
  const maxDistance = 500; // The maximum distance at which the beeping interval is maxInterval

  // Ensure distance is within the maximum distance range
  const validDistance = Math.min(distance, maxDistance);

  // Linear interpolation between minInterval and maxInterval based on distance
  const interval =
    minInterval + (maxInterval - minInterval) * (validDistance / maxDistance);
  console.log(
    `Valid distance: ${validDistance}, Calculated sonar interval: ${interval} ms for distance: ${distance}`,
  );
  return interval;
}

function sonarBeep() {
  if (!sonarEnabled) return;

  let closestPlayer = null;
  let closestDistance = Infinity;

  // Local player's canvas position (assuming the center of the radar is at (250, 250))
  const localPlayerX = 250;
  const localPlayerY = 250;

  for (const player of playersHandler.playersInRange) {
    // Get the player's transformed position using playersDrawingInstance
    const transformedPlayer = playersDrawingInstance.transformPoint(
      player.hX,
      player.hY,
    );

    // Calculate distance from the local player's position to the other player's position
    const distance = Math.sqrt(
      Math.pow(transformedPlayer.x - localPlayerX, 2) +
        Math.pow(transformedPlayer.y - localPlayerY, 2),
    );

    player.distance = distance; // Store the calculated distance in the player object
    console.log(
      `Player position: (${transformedPlayer.x}, ${transformedPlayer.y}), Distance: ${distance}`,
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestPlayer = player;
    }
  }

  if (closestPlayer) {
    const interval = calculateSonarInterval(closestDistance);
    console.log(
      `Closest player position: (${closestPlayer.hX}, ${closestPlayer.hY}), Beep interval: ${interval} ms, Distance: ${closestDistance}`,
    );
    playBeep();
    clearTimeout(sonarTimeout);
    sonarTimeout = setTimeout(sonarBeep, interval); // Use setTimeout for adaptive intervals
  } else {
    console.log("No players in range. Rechecking...");
    // Check again after a default interval if no players are found
    const defaultInterval = 1000; // Check every 1 second when no players are in range
    clearTimeout(sonarTimeout);
    sonarTimeout = setTimeout(sonarBeep, defaultInterval);
  }
}

document.getElementById("sonarButton").addEventListener("click", function () {
  sonarEnabled = !sonarEnabled;
  this.textContent = sonarEnabled ? "Disable Sonar" : "Enable Sonar";
  console.log(`Sonar ${sonarEnabled ? "enabled" : "disabled"}`);

  if (sonarEnabled) {
    sonarBeep(); // Start the sonar beep immediately
  } else {
    clearTimeout(sonarTimeout);
  }
});

//END OF SONAR CODE

// PLAYER DIRECTION ANNOUNCER CODE
let announcerEnabled = false;
let announcerInterval;
let lastAnnouncedDirection = null;
let lastAnnounceTime = 0;

function getDirection(deltaX, deltaY) {
  const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

  if (angle >= -22.5 && angle < 22.5) {
    return "enemy_on_the_right";
  } else if (angle >= 22.5 && angle < 67.5) {
    return "enemy_bottom_right";
  } else if (angle >= 67.5 && angle < 112.5) {
    return "enemy_at_the_bottom";
  } else if (angle >= 112.5 && angle < 157.5) {
    return "enemy_bottom_left";
  } else if (
    (angle >= 157.5 && angle <= 180) ||
    (angle >= -180 && angle < -157.5)
  ) {
    return "enemy_on_the_left";
  } else if (angle >= -157.5 && angle < -112.5) {
    return "enemy_top_left";
  } else if (angle >= -112.5 && angle < -67.5) {
    return "enemy_at_the_top";
  } else if (angle >= -67.5 && angle < -22.5) {
    return "enemy_top_right";
  }
}

function announceDirection(direction) {
  const currentTime = Date.now();
  if (
    direction !== lastAnnouncedDirection ||
    currentTime - lastAnnounceTime > 2000
  ) {
    const audio = new Audio(`/sounds/${direction}.mp3`);
    // Get volume from the slider (converted from 0-100 to 0.0-1.0 range)
    const volume = document.getElementById("announcerVolumeSlider").value / 100;
    audio.volume = volume;
    audio.play();
    lastAnnouncedDirection = direction;
    lastAnnounceTime = currentTime;
  }
}

function detectPlayers() {
  if (!announcerEnabled) return;

  let closestPlayer = null;
  let closestDistance = Infinity;

  // Local player's canvas position (assuming the center of the radar is at (250, 250))
  const localPlayerX = 250;
  const localPlayerY = 250;

  for (const player of playersHandler.playersInRange) {
    // Get the player's transformed position using playersDrawingInstance
    const transformedPlayer = playersDrawingInstance.transformPoint(
      player.hX,
      player.hY,
    );

    // Calculate distance from the local player's position to the other player's position
    const distance = Math.sqrt(
      Math.pow(transformedPlayer.x - localPlayerX, 2) +
        Math.pow(transformedPlayer.y - localPlayerY, 2),
    );

    player.distance = distance; // Store the calculated distance in the player object

    if (distance < closestDistance) {
      closestDistance = distance;
      closestPlayer = player;
    }
  }

  if (closestPlayer) {
    const transformedClosestPlayer = playersDrawingInstance.transformPoint(
      closestPlayer.hX,
      closestPlayer.hY,
    );
    const deltaX = transformedClosestPlayer.x - localPlayerX;
    const deltaY = transformedClosestPlayer.y - localPlayerY;
    const direction = getDirection(deltaX, deltaY);
    announceDirection(direction);
  } else {
    console.log("No players in range. Rechecking...");
  }
}

document
  .getElementById("announcerButton")
  .addEventListener("click", function () {
    announcerEnabled = !announcerEnabled;
    this.textContent = announcerEnabled
      ? "Disable Player Direction Announcer"
      : "Enable Player Direction Announcer";
    console.log(
      `Player Direction Announcer ${announcerEnabled ? "enabled" : "disabled"}`,
    );

    if (announcerEnabled) {
      detectPlayers(); // Check immediately when enabled
      announcerInterval = setInterval(detectPlayers, 1000); // Check every 1 second
    } else {
      clearInterval(announcerInterval);
    }
  });

// END OF PLAYER DIRECTION ANNOUNCER CODE

setDrawingViews();

function setDrawingViews() {
  const mainWindowMarginXValue = localStorage.getItem("mainWindowMarginX");
  const mainWindowMarginYValue = localStorage.getItem("mainWindowMarginY");
  const itemsWindowMarginXValue = localStorage.getItem("itemsWindowMarginX");
  const itemsWindowMarginYValue = localStorage.getItem("itemsWindowMarginY");
  const settingItemsBorderValue = localStorage.getItem("settingItemsBorder");
  const buttonMarginXValue = localStorage.getItem("buttonMarginX");
  const buttonMarginYValue = localStorage.getItem("buttonMarginY");

  const itemsWidthValue = localStorage.getItem("itemsWidth");
  const itemsHeightValue = localStorage.getItem("itemsHeight");

  // Check if the values exist in local storage and handle them
  if (mainWindowMarginXValue !== null) {
    document.getElementById("rightCanvas").style.left =
      mainWindowMarginXValue + "px";
    document.getElementById("drawCanvas").style.left =
      mainWindowMarginYValue + "px";
  }

  if (mainWindowMarginYValue !== null) {
    document.getElementById("drawCanvas").style.top =
      mainWindowMarginYValue + "px";
    document.getElementById("rightCanvas").style.top =
      mainWindowMarginYValue + "px";
  }

  if (itemsWindowMarginXValue !== null) {
    document.getElementById("playersCanvas").style.left =
      itemsWindowMarginXValue + "px";
  }

  if (itemsWindowMarginYValue !== null) {
    document.getElementById("playersCanvas").style.top =
      itemsWindowMarginYValue + "px";
  }

  if (itemsWidthValue !== null) {
    document.getElementById("playersCanvas").style.width =
      itemsWidthValue + "px";
  }

  if (itemsHeightValue !== null) {
    document.getElementById("playersCanvas").style.height =
      itemsHeightValue + "px";
  }

  if (settingItemsBorderValue !== null) {
    // Apply border based on the settingItemsBorderValue
    if (settingItemsBorderValue === "true") {
      document.getElementById("playersCanvas").style.border = "2px solid grey";
    } else {
      document.getElementById("playersCanvas").style.border = "none";
    }
  }

  if (buttonMarginXValue !== null) {
    document.getElementById("button").style.left = buttonMarginXValue + "px";
  }

  if (buttonMarginYValue !== null) {
    document.getElementById("button").style.top = buttonMarginYValue + "px";
  }
}
