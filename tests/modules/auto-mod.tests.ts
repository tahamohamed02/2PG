import { use, should, expect } from 'chai';
import { GuildDocument, MessageFilter, SavedGuild } from '../../models/guild';
import { mock } from 'ts-mockito';
import AutoMod from '../../modules/auto-mod/auto-mod';
import { Message, Guild, GuildMember } from 'discord.js';
import chaiAsPromised from 'chai-as-promised';
import DBWrapper from '../../data/db-wrapper';
import { MemberDocument, SavedMember } from '../../models/member';
import Members from '../../data/members';

use(chaiAsPromised);
should();

describe('AutoMod', () => {
    describe('validateMsg', () => {
        it('contains ban word, has filter, error thrown', async() =>
        {            
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();

            guild.autoMod.filters = [MessageFilter.Words];
            guild.autoMod.banWords = ['a'];
            msg.content = 'a';

            const result = () => AutoMod.validateMsg(msg, guild);

            result().should.eventually.throw();
        });
        
        it('contains ban word, has filter, auto deleted, error thrown', async() =>
        {            
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();

            guild.autoMod.filters = [MessageFilter.Words];
            guild.autoMod.banWords = ['a'];
            msg.content = 'a';
            msg.delete = () => { throw new Error('deleted'); }

            const result = () => AutoMod.validateMsg(msg, guild);

            result().should.eventually.throw('deleted');
        });

        it('contains ban word, no filter, ignored', async() =>
        {
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();

            guild.autoMod.filters = [];
            guild.autoMod.banWords = [];
            msg.content = 'a';

            const result = () => AutoMod.validateMsg(msg, guild);

            result().should.not.eventually.throw();
        });
        
        it('contains ban link, has filter, error thrown', async() =>
        {            
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();
            
            guild.autoMod.filters = [MessageFilter.Links];
            guild.autoMod.banLinks = ['a'];
            msg.content = 'a';

            const result = () => AutoMod.validateMsg(msg, guild);

            result().should.eventually.throw();
        });
        
        it('contains ban link, no filter, ignored', async() =>
        {            
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();

            guild.autoMod.filters = [];
            guild.autoMod.banLinks = ['a'];
            msg.content = 'a';

            const result = () => AutoMod.validateMsg(msg, guild);

            result().should.not.eventually.throw();
        });
    });

    describe('warnMember', () =>
    {
        it('warn member, message sent to user', async() =>
        {
            AutoMod.members = mock<Members>();
            AutoMod.members.get = (): any => {
                return new SavedMember();
            };

            const member: any = { id: '123', send: () => { throw new Error() }, user: { bot: false }};
            const instigator: any = { id: '321' };

            const result = () => AutoMod.warnMember(member, instigator);

            result().should.eventually.throw();
        });

        it('warn self member, error thrown', async() =>
        {
            AutoMod.members = mock<Members>();
            AutoMod.members.get = (): any => {
                return new SavedMember();
            };

            const member: any = { id: '123', user: { bot: false } };
            const instigator: any = { id: '123' };

            const result = () => AutoMod.warnMember(member, instigator);

            result().should.eventually.throw();
        });

        it('warn bot member, error thrown', async() =>
        {
            AutoMod.members = mock<Members>();
            AutoMod.members.get = (): any => {
                return new SavedMember();
            };

            const member: any = { id: '123', user: { bot: true }};
            const instigator: any = { id: '321' };

            const result = () => AutoMod.warnMember(member, instigator);

            result().should.eventually.throw();
        });
    });
});