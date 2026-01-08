import { RandUtil } from "@sammo/common";
import { City, Nation } from "./entities.js";
import { GameConst } from "./GameConst.js";
import type { WarUnit, WarUnitCity as IWarUnitCity, WarBattleLogEntry } from "./specials/types.js";

/**
 * WarUnit 인터페이스의 도시(성벽) 구현체
 * 레거시 WarUnitCity.php 및 WarEngine.ts 내부 로직 참조
 */
export class WarUnitCity implements WarUnit, IWarUnitCity {
    public def: number;
    public wall: number;
    public trust: number;

    public crew: number; // def * 10
    public crewType: number = GameConst.armType.CASTLE;
    public train: number;
    public atmos: number;
    public dex: Record<number, number>;
    public oppose?: WarUnit | IWarUnitCity;
    public battleLog: WarBattleLogEntry[] = [];
    public phase = 0;
    public warPowerMultiplier = 1.0;
    public activatedSkills = new Set<string>();

    private killed = 0;
    private dead = 0;
    private wallDamage = 0;

    constructor(
        public readonly city: City,
        public readonly nation: Nation | null,
        public readonly rng: RandUtil,
        public readonly gameYear: number,
        public readonly startYear: number
    ) {
        this.def = city.def;
        this.wall = city.wall;
        this.trust = city.trust;

        this.crew = city.def * 10;
        // 도시 훈사: 시작년도 기준 60~110
        const cityTrainAtmos = Math.min(110, Math.max(60, gameYear - startYear + 59));
        this.train = cityTrainAtmos;
        this.atmos = cityTrainAtmos;

        // 도시 숙련도: (훈사 - 60) * 7200
        const cityDexValue = (cityTrainAtmos - 60) * 7200;
        this.dex = { [this.crewType]: cityDexValue };
    }

    // WarUnit implementation
    get general(): any {
        return { name: this.city.name, id: -this.city.id };
    }

    get isAttacker(): boolean {
        return false;
    }

    getGeneral(): any {
        return this.general;
    }

    getOppose(): WarUnit | IWarUnitCity | undefined {
        return this.oppose;
    }

    hasActivatedSkillOnLog(skillName: string): number {
        return this.battleLog.filter((entry) => entry.skillName === skillName && entry.activated)
            .length;
    }

    activateSkill(skill: string): void {
        this.activatedSkills.add(skill);
    }

    deactivateSkill(skill: string): void {
        this.activatedSkills.delete(skill);
    }

    hasActivatedSkill(skill: string): boolean {
        return this.activatedSkills.has(skill);
    }

    multiplyWarPower(multiplier: number): void {
        this.warPowerMultiplier *= multiplier;
    }

    // City specific logic
    getAttack(): number {
        return (this.def + this.wall * 9) / 500 + 200;
    }

    getDefense(): number {
        return (this.def + this.wall * 9) / 500 + 200;
    }

    getSpeed(): number {
        return 7;
    }

    getCrew(): number {
        return this.crew;
    }

    decreaseHP(damage: number): number {
        const actualDamage = Math.min(damage, this.crew);
        this.crew -= actualDamage;
        this.dead += actualDamage;
        // 성벽 손상
        this.wallDamage += actualDamage / 20;
        return this.crew;
    }

    increaseKilled(damage: number): void {
        this.killed += damage;
    }

    canContinue(): { canContinue: boolean; noRice: boolean } {
        if (this.crew <= 0) {
            return { canContinue: false, noRice: false };
        }
        return { canContinue: true, noRice: false };
    }

    getKilled(): number {
        return this.killed;
    }

    getDead(): number {
        return this.dead;
    }

    getWallDamage(): number {
        return this.wallDamage;
    }

    applyToCity(): Partial<City> {
        return {
            def: Math.max(0, Math.round(this.crew / 10)),
            wall: Math.max(0, Math.round(this.city.wall - this.wallDamage)),
        };
    }

    addBattleLog(entry: WarBattleLogEntry): void {
        this.battleLog.push(entry);
    }

    setOppose(oppose: WarUnit | IWarUnitCity): void {
        this.oppose = oppose;
    }

    advancePhase(): void {
        this.phase++;
    }

    resetPhaseState(): void {
        this.activatedSkills.clear();
        this.warPowerMultiplier = 1.0;
    }
}
