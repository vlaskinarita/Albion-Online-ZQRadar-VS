export async function GetMobList() {
  let resp = undefined;

  try {
    resp = await fetch("./mob-info/mobs.json");
    resp = await resp.json();
  } catch (error) {}

  var mobList = {};

  if (resp == undefined) return mobList;

  function addItem(id, tier, type, loc) {
    if (!mobList[id]) mobList[id] = [];
    else return;

    mobList[id][0] = tier;
    mobList[id][1] = type;
    mobList[id][2] = loc;
  }

  for (const [key, value] of Object.entries(resp.mobs)) {
    addItem(parseInt(key), value[0], value[1], value[2]);
  }

  return mobList;
}
