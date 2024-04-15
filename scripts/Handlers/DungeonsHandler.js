const DungeonType = 
{
    Solo: 0,
    Group: 1,
    Corrupted: 2,
    Hellgate: 3
};

class Dungeon
{
    constructor(id, posX, posY, name, type, enchant)
    {
        this.id = id;
        this.posX = posX;
        this.posY = posY;
        this.name = name;
        this.enchant = enchant;

        this.type = type;

        this.drawName = undefined

        this.hY = 0;
        this.hX = 0;

        this.SetDrawNameByType();
    }

    SetDrawNameByType()
    {
        switch (this.type)
        {
            case DungeonType.Solo:
                this.drawName = "dungeon_" + this.enchant;
                break;
            
            case DungeonType.Group:
                this.drawName = "group_" + this.enchant;
                break;

            case DungeonType.Corrupted:
                this.drawName = "corrupt";
                break;

            case DungeonType.Hellgate:
                this.drawName = "hellgate";
                break;
        }
    }
}

class DungeonsHandler
{
    constructor(Settings)
    {
        this.dungeonList = [];
        this.settings = Settings;
    }

    dungeonEvent(parameters)
    {
        const id = parameters[0];
        const position = parameters[1];
        const name = parameters[3];
        const enchant = parameters[6];

        this.addDungeon(id, position[0], position[1], name, enchant);
    }

    addDungeon(id, posX, posY, name, enchant)
    {        
        if (this.dungeonList.some(item => item.id === id))
            return;

        const lowerCaseName = name.toLowerCase(name);
        let dungeonType = undefined;

        // Corrupted dungeons have "solo" in their names
        // So check before solo to avoir problems
        // "CORRUPTED_SOLO"
        if (lowerCaseName.includes("corrupted")) // corrupt
        {
            // Test if corrupt checkbox
            if (!this.settings.dungeonCorrupted) return;

            dungeonType = DungeonType.Corrupted;
        }
        else if (lowerCaseName.includes("solo")) // solo
        {
            // Test if solo checkbox
            if (!this.settings.dungeonSolo || !this.settings.dungeonEnchants[enchant]) return;

            dungeonType = DungeonType.Solo;
        }
        // "HELLGATE_2V2_NON_LETHAL"
        else if (lowerCaseName.includes("hellgate")) // hellgate
        {
            if (!this.settings.dungeonHellgate) return;

            dungeonType = DungeonType.Hellgate

        }
        else // group
        {
            if (!this.settings.dungeonGroup || !this.settings.dungeonEnchants[enchant]) return;

            dungeonType = DungeonType.Group;
        }

        const d = new Dungeon(id, posX, posY, name, dungeonType, enchant);
        this.dungeonList.push(d);
    }

    RemoveDungeon(id)
    {
        this.dungeonList = this.dungeonList.filter((dungeon) => dungeon.id !== id);
    }
}