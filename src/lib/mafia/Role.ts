import Player from '@mafia/Player';

abstract class Role {

	public cleaned = false;
	public name = '';
	public constructor(public player: Player) {
	}

	public get displayRole(): string {
		if (this.cleaned) return 'Cleaned';
		return this.name;
	}

	// Role categories such as Random Town, Neutral Evil
	public static categories: Array<string> = [];

	// Docs used in roleinfo command
	public static documentation = '';

}

interface Role {
	onEvent(name: string, ...args: Array<any>): Promise<any>;
}

export default Role;
