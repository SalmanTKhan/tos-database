import {TOSAttackType, TOSElement, TOSEntity, TOSEntityLink, TOSStat} from "../entity/tos-entity.model";
import {TOSBuildStats} from "../tos-build";

export class TOSSkill extends TOSEntity {
  private static readonly LUA_CONTEXT: string[] = [ // Some global functions used by the formulas
    'var GetAbility = (a, b) => null;',
    'var GetExProp = (a, b) => null;',
    'var GetSumOfEquipItem = (a, b) => 0;',
    'var IsBuffApplied = (a, b) => null;',
    'var IsPVPServer = (a) => 0;',
    'var TryGetProp = (a, b) => a ? a[b] : null;',
    'var skillOwner = ' + JSON.stringify({ ClassName: 'PC' }) + ';',
    'var value = 0;',
    'var zone = null;',
  ];
  private static readonly STATS_RUNTIME = { // Additional stats (besides CON, DEX, INT, STR, SPR) used by the formulas
    'Lv': 'Level',
    'HR': TOSStat.ACCURACY,
    'MHP': TOSStat.HP,
    'MSP': TOSStat.SP,
    'SR': TOSStat.AOE_ATTACK_RATIO,
    'MSPD': TOSStat.MOVEMENT_SPEED,
    'MDEF': TOSStat.DEFENSE_MAGICAL,
    'DEF': TOSStat.DEFENSE_PHYSICAL,
    'PATK': TOSStat.ATTACK_PHYSICAL,
    'MATK': TOSStat.ATTACK_MAGICAL,
    'MAXATK': TOSStat.ATTACK_LIMIT_MAX,
    'MAXMATK': 'Maximum Magic Attack',
    'MAXPATK': 'Minimum Physical Attack',
    'MINATK': TOSStat.ATTACK_LIMIT_MIN,
    'MINMATK': 'Minimum Magic Attack',
    'MINPATK': 'Minimum Physical Attack',
  };

  private readonly effect: string;
  private readonly effectCaptionRatio: string[];
  private readonly effectCaptionRatio2: string[];
  private readonly effectCaptionRatio3: string[];
  private readonly effectCaptionTime: string[];
  private readonly effectSkillAtkAdd: string[];
  private readonly effectSkillFactor: string[];
  private readonly effectSkillSR: string[];
  private readonly effectSpendItemCount: string[];
  private readonly effectSpendPoison: string[];
  private readonly effectSpendSP: string[];
  private readonly levelMax: number;
  private readonly prop_BasicPoison: number;
  private readonly prop_LvUpSpendPoison: number;
  private readonly prop_SklAtkAdd: number;
  private readonly prop_SklAtkAddByLevel: number;
  private readonly prop_SklFactor: number;
  private readonly prop_SklFactorByLevel: number;
  private readonly prop_SklSR: number;
  private readonly prop_SpendItemBaseCount: number;
  private readonly sp: number;

  readonly CoolDown: number;
  readonly DescriptionHTML: string;
  readonly Element: TOSElement;
  readonly LevelPerCircle: number;
  readonly OverHeat: number;
  readonly RequiredCircle: number;
  readonly RequiredStance: TOSSkillRequiredStance[];
  readonly RequiredStanceCompanion: TOSSkillRequiredStanceCompanion;
  readonly RequiredSubWeapon: boolean;
  readonly SPPerLevel: number;
  readonly TypeAttack: TOSAttackType;


  readonly Link_Attributes: TOSEntityLink[];
  readonly Link_Gem: TOSEntityLink;
  readonly Link_Job: TOSEntityLink;

  constructor(json: TOSSkill) {
    super(json);

    this.DescriptionHTML = this.tooltipToHTML(this.Description);
    this.Description = null;

    this.CoolDown = +json.CoolDown;
    this.effect = this.tooltipToHTML(json['Effect'] + '');
    this.effectCaptionRatio = this.effectFromJSON(json['EffectCaptionRatio']);
    this.effectCaptionRatio2 = this.effectFromJSON(json['EffectCaptionRatio2']);
    this.effectCaptionRatio3 = this.effectFromJSON(json['EffectCaptionRatio3']);
    this.effectCaptionTime = this.effectFromJSON(json['EffectCaptionTime']);
    this.effectSkillAtkAdd = this.effectFromJSON(json['EffectSkillAtkAdd']);
    this.effectSkillFactor = this.effectFromJSON(json['EffectSkillFactor']);
    this.effectSkillSR = this.effectFromJSON(json['EffectSkillSR']);
    this.effectSpendItemCount = this.effectFromJSON(json['EffectSpendItemCount']);
    this.effectSpendPoison = this.effectFromJSON(json['EffectSpendPoison']);
    this.effectSpendSP = this.effectFromJSON(json['EffectSpendSP']);
    this.Element = Object.values(TOSElement)[+json.Element];
    this.levelMax = +json['LevelMax'];
    this.LevelPerCircle = +json.LevelPerCircle;
    this.OverHeat = +json.OverHeat;
    this.prop_BasicPoison = +json['Prop_BasicPoison'];
    this.prop_LvUpSpendPoison = +json['Prop_LvUpSpendPoison'];
    this.prop_SklAtkAdd = +json['Prop_SklAtkAdd'];
    this.prop_SklAtkAddByLevel = +json['Prop_SklAtkAddByLevel'];
    this.prop_SklFactor = +json['Prop_SklFactor'];
    this.prop_SklFactorByLevel = +json['Prop_SklFactorByLevel'];
    this.prop_SklSR = +json['Prop_SklSR'];
    this.prop_SpendItemBaseCount = +json['Prop_SpendItemBaseCount'];
    this.RequiredCircle = +json.RequiredCircle;
    this.RequiredStance = json.RequiredStance
      ? JSON
        .parse(json.RequiredStance + '')
        .map(json => new TOSSkillRequiredStance(json))
      : null;
    this.RequiredStanceCompanion = Object.values(TOSSkillRequiredStanceCompanion)[+json.RequiredStanceCompanion];
    this.RequiredSubWeapon = (json.RequiredSubWeapon + '') == 'YES';
    this.sp = +json['SP'];
    this.SPPerLevel = +json.SPPerLevel;
    this.TypeAttack = Object.values(TOSAttackType)[+json.TypeAttack];

    this.Link_Attributes = json.Link_Attributes
      ? JSON
        .parse(json.Link_Attributes + '')
        .map(json => new TOSEntityLink(json))
      : null;
    this.Link_Gem = json.Link_Gem ? new TOSEntityLink(json.Link_Gem) : null;
    this.Link_Job = json.Link_Job ? new TOSEntityLink(json.Link_Job) : null;
  }

  Effect(level: number, stats: TOSBuildStats): string {
    //console.log('effect:', this.effect);
    let dependencies: string[] = [];
    let effect: string = this.effect;
    let match: RegExpExecArray;
    let regexEffect = /(?:#{(\w+)}#)+/g;

    // Match effect properties (e.g. #{SkillFactor}#%{nl}AoE Attack Ratio: #{SkillSR}
    while (match = regexEffect.exec(this.effect)) {
      // console.log('prop:', match[1]);
      let prop = match[1];
      let value = this.effectToValue(this['effect' + prop], level, stats);

      dependencies = dependencies.concat(value.dependencies);
      effect = effect.replace(match[0], value.value + (value.dependencies.length ? '*' : ''));
    }

    // Add dependencies (if available)
    if (dependencies) {
      effect = effect + '\n';
      dependencies.forEach(value => effect = effect + "\n* Depends on Character's " + value);
    }

    return effect.replace(/{nl}/g, '\n');
    //console.log(this.effectSkillFactor.join('\n'))
    //lua.run({ skill: { SklFactor: this.prop_SklFactor, SklFactorByLevel: this.prop_SklFactorByLevel, Level: this.level.getValue() }}, this.effectSkillFactor.join('\n'), onResult);
  }
  LevelMax(circle?: number): number {
    return circle != undefined
      ? (circle - this.RequiredCircle + 1) * this.LevelPerCircle
      : this.levelMax;
  }
  SP(level: number): number { return this.sp + this.SPPerLevel * level }

  get BasicPoison(): number { return this.prop_BasicPoison; }
  get LvUpSpendPoison(): number { return this.prop_LvUpSpendPoison; }
  get SklAtkAdd(): number { return this.prop_SklAtkAdd; }
  get SklAtkAddByLevel(): number { return this.prop_SklAtkAddByLevel; }
  get SklFactor(): number { return this.prop_SklFactor; }
  get SklFactorByLevel(): number { return this.prop_SklFactorByLevel; }
  get SklSR(): number { return this.prop_SklSR; }
  get SpendItemBaseCount(): number { return this.prop_SpendItemBaseCount; }

  private effectFromJSON(json: any): string[] {
    return json ? JSON.parse(json) : null;
  }
  private effectToHuman(effect: string[]): string {
    return null;
    /* TODO:
    if (effect == null) return null;

    //let attributes: {regex: RegExp, replace: string}[] = [];
    let result: string[] = [];

    let regexAttribute = /(local .+= )GetAbility\(pc, "(.+)"\)/g;
    let regexSkill = /(?:skill\.(\w+))+/g;
    let regexTryGetProp = /TryGetProp\((.+),.*"(.+)"\)/g;
    let match: RegExpExecArray;

    for (let line of effect) {
      let lineOriginal = line;
      let isPlayerDeclaration: boolean = line.indexOf('GetSkillOwner(skill)') != -1;

      if (isPlayerDeclaration)
        continue;

      // Match attribute declaration (e.g. local abil = GetAbility(pc, "Peltasta11"))
      while (match = regexAttribute.exec(lineOriginal)) {
        let attribute = this.Link_Attributes.find(value => value.$ID_NAME == match[2]);
        line = match[1] + '[Attribute ' + attribute.Name + ']';
      }

      // Match property retrieval (e.g. local abilLevel = TryGetProp(abil, "Level"))
      while (match = regexTryGetProp.exec(lineOriginal)) {
        line = line.replace(match[0], match[1] + '.' + match[2]);
      }

      while (match = regexSkill.exec(lineOriginal)) {
        if (this[match[1]] && match[1] != 'Level')
          line = line.replace(match[0], this[match[1]]);
        else
          line = line.replace(match[0], '[Skill ' + match[1] + ']');
      }

      // Minor syntax adjustments
      line = line.replace('~=', 'not');
      line = line.replace('nil', 'None');
      line = line.replace('local ', 'var ');
      line = line.replace('math', 'Math');

      result.push(line);
    }

    return result.join('\n');
    */
  }
  private effectToValue(effect: string[], level: number, stats: TOSBuildStats): { dependencies: string[], value: number} {
    let dependencies: string[] = [];
    let pc: object = { CON: stats.CON, DEX: stats.DEX, INT: stats.INT, MNA: stats.SPR, STR: stats.STR };
    let skill: object = { Level: Math.max(1, level) };
    let match: RegExpExecArray;

    // Prepare player and skill
    effect.forEach(line => {
      let regexPlayer = /(?:pc\.(\w+))+/g; // Note: we need to reset it on every new line so it doesn't skip matches
      let regexSkill = /(?:skill\.(\w+))+/g; // Note: we need to reset it on every new line so it doesn't skip matches

      // Match player properties (e.g. value = value + pc.MINPATK * (Monk2_abil.Level*0.2))
      while (match = regexPlayer.exec(line)) {
        let prop: string = match[1];

        if (pc[prop] == undefined) {
          dependencies.push(TOSSkill.STATS_RUNTIME[prop] + '');
          pc[prop] = 1;
        }
      }

      // Match skill properties (e.g. local value = skill.SklAtkAdd + (skill.Level - 1) * skill.SklAtkAddByLevel;)
      while (match = regexSkill.exec(line)) {
        let prop: string = match[1];

        if (prop == 'SkillFactor')
          skill[prop] = this.effectToValue(this.effectSkillFactor, level, stats).value;
        else if (prop != 'Level')
          skill[prop] = this[prop]
      }
    });

    // Execute function
    let func: string[] = [];
    func.push('(function () {');
    func.push('var pc = ' + JSON.stringify(pc) + ';');
    func.push('var skill = ' + JSON.stringify(skill) + ';');
    func = func.concat(TOSSkill.LUA_CONTEXT);
    func = func.concat(effect);
    func.push('}())');

    //console.log('Executing effect function:\n', func.join('\n'));

    return { dependencies: dependencies, value: eval(func.join('\n')) };
  }

  private tooltipToHTML(description: string): string {
    if (description == null) return null;

    let regexColor = /{(#.+?)}{ol}(\[.+?\])/g;
    let match: RegExpExecArray;

    while (match = regexColor.exec(description)) {
      if (match[2].indexOf('speedofatk'))
        match[2] = match[2].replace('{img tooltip_speedofatk}', ' <img src="assets/images/skill_attackspeed.png" /> ');

      description = description.replace(match[0], '<span style="color: ' + match[1] + '">' + match[2] + '</span>');
    }

    return description.replace(/{\/}/g, '');
  }
}

export class TOSSkillRequiredStance {
  Icon: string;
  Name: string;

  constructor(json: TOSSkillRequiredStance) {
    this.Icon = 'assets/icons/' + json.Icon + '.png';
    this.Name = json.Name;
  }
}

export enum TOSSkillRequiredStanceCompanion {
  BOTH = 'Both',
  NO = 'No',
  YES = 'Yes'
}
