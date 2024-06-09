class Cage {
  constructor(id, posX, posY, name) {
    this.id = id;
    this.posX = posX;
    this.posY = posY;
    this.name = name;
    this.hX = 0;
    this.hY = 0;
  }
}

export class WispCageHandler {
  constructor(settings) {
    this.settings = settings;
    this.cages = [];
  }

  NewCageEvent(Parameters) {
    if (!this.settings.wispCage || Parameters[4] != undefined) return;

    const id = Parameters[0];

    if (this.cages.some((cage) => cage.id === id)) return;

    this.cages.push(
      new Cage(
        Parameters[0],
        Parameters[1][0],
        Parameters[1][1],
        Parameters[2],
      ),
    );
  }

  CageOpenedEvent(Parameters) {
    if (!this.settings.wispCage) return;

    const id = Parameters[0];

    if (!this.cages.some((cage) => cage.id === id)) return;

    this.RemoveCage(id);
  }

  RemoveCage(id) {
    this.cages = this.cages.filter((cage) => cage.id !== id);
  }

  removeNotInRange(lpX, lpY) {
    this.cages = this.cages.filter(
      (x) => this.calculateDistance(lpX, lpY, x.posX, x.posY) <= 80,
    );
  }

  calculateDistance(lpX, lpY, posX, posY) {
    const deltaX = lpX - posX;
    const deltaY = lpY - posY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
  }
}
