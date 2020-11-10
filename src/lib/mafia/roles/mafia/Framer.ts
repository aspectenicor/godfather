import NightActionsManager, { NightActionCommand, NightActionPriority } from '../../managers/NightActionsManager';
import ActionRole from '../../mixins/ActionRole';
import MafiaRole from '../../mixins/MafiaRole';
import Player from '../../Player';

class Framer extends ActionRole {

	public name = 'Framer';

	public description = 'You may frame a player every night, making them appear suspicious to others.';

	public action = NightActionCommand.Frame;
	public actionGerund = 'framing';
	public actionText = 'frame a player';
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public priority = NightActionPriority.FRAMER;

	public setUp(actions: NightActionsManager, target: Player) {
		actions.framedPlayers.push(target);
	}

	public static documentation = 'Roleinfo docs here.';

}

export default MafiaRole(Framer);