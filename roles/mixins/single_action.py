from discord.ext import commands
from roles import Role

conv = commands.MemberConverter()


class SingleAction(Role):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.can_block = True
        self.can_transport = True
        self.can_self_target = False

    async def on_night(self, bot, player, game):
        output = f'It is now night {game.cycle}. Use the {bot.command_prefix}{self.action} command to {self.action_text}. ' \
            + f'Use {bot.command_prefix}cancel to cancel.\n'
        output += f'```diff\n{game.show_players(codeblock=True)}```'
        await player.user.send(output)

    async def on_pm_command(self, ctx, game, player, args):
        can_do, reason = self.can_do_action(game)
        if not can_do:
            return await ctx.send(f'You cannot use your action today. {reason}')

        args = ' '.join(args)

        if args == 'noaction':
            for action in game.night_actions.actions:
                if action['player'].user.id == player.user.id:
                    game.night_actions.actions.remove(action)

            game.night_actions.add_action({
                'action': None,
                'player': player,
                'priority': 0
            })
            return await ctx.send('You decided to stay home tonight.')

        if not args.isdigit():
            return await ctx.send('Pick a valid number from the playerlist.')

        num = int(args)
        if num > len(game.players):
            return await ctx.send(f'There are only {len(game.players)} playing.')
        target_pl = game.players[num - 1]
        target = target_pl.user

        if target_pl is None:
            return await ctx.send('Invalid input')
        can_target, reason = self.can_target(player, target_pl)
        if not can_target:
            return await ctx.send(reason)

        for action in game.night_actions.actions:
            if action['player'].user.id == player.user.id:
                game.night_actions.actions.remove(action)

        # special godfather stuff
        if self.name == 'Godfather' and len(game.filter_players(role='Goon')) > 0:
            goon = game.filter_players(role='Goon')[0]
            for action in game.night_actions.actions:
                if action['player'].role.name == 'Goon':
                    game.night_actions.actions.remove(action)

            game.night_actions.add_action({
                'action': self.action,
                'player': goon,
                'target': target_pl,
                'priority': self.action_priority,
                'can_block': self.can_block,
                'can_transport': self.can_transport
            })

        game.night_actions.add_action({
            'action': self.action,
            'player': player,
            'target': target_pl,
            'priority': self.action_priority,
            'can_block': self.can_block,
            'can_transport': self.can_transport
        })
        await ctx.send(f'You are {self.action_gerund} {target} tonight.')

        if len(game.filter_players(action_only=True)) == len(game.night_actions.actions):
            await game.increment_phase(ctx.bot)

    async def after_action(self, player, target, night_record):
        pass

    def can_do_action(self, game):
        return True, ''

    def can_target(self, player, target):
        if not target.alive:
            return False, 'You cannot target dead players.'
        if target.user.id == player.user.id and not self.can_self_target:
            return False, f'As a {self.name}, you cannot self target.'
        return True, ''