import SurivorFaction from '@mafia/factions/neutral/Survivor';
import { Defense, NightActionPriority } from '@mafia/managers/NightActionsManager';
import NoTarget from '@mafia/mixins/NoTarget';
import Player from '@mafia/Player';

export default class Survivor extends NoTarget {

	public name = 'Survivor';
	public faction = new SurivorFaction();
	public action = 'vest';
	public actionGerund = 'vesting';
	public actionText = 'protect yourself at night';
	public priority = NightActionPriority.SURVIVOR;
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: false
	};

	private vested = false;
	private vests: number;

	public constructor(player: Player, context: SurvivorContext = {}) {
		super(player);
		if (typeof context.vests === 'number') this.vests = context.vests;
		else this.vests = this.getInitialVests();

		this.description = `You may vest ${this.vests} time${this.vests === 1 ? '' : 's'} in a game.`;
	}

	public canUseAction() {
		if (this.vests === 0) return { check: false, reason: 'You don\'t have any vests left' };
		return super.canUseAction();
	}

	public get defense() {
		if (this.vested) return Defense.Basic;
		return Defense.None;
	}

	public setUp() {
		this.vested = true;
	}

	public runAction() {
		this.vests--;
	}

	public tearDown() {
		this.vested = false;
	}

	public get extraNightContext() {
		if (this.vests > 0) return `You have ${this.vests} vest${this.vests === 1 ? '' : 's'} remaining.`;
		return null;
	}

	private getInitialVests() {
		if (this.game.players.length <= 5) return 1;
		if (this.game.players.length <= 10) return 2;
		return 4;
	}

}

export interface SurvivorContext {
	vests?: number;
}

Survivor.aliases = ['Surv'];
Survivor.categories = [...Survivor.categories, 'Neutral Benign', 'Good'];
