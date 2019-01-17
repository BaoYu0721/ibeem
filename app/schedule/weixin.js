const Subscription = require('egg').Subscription;

class Weixin extends Subscription{
    static get schedule(){
        return {
            type: 'worker',
            cron: '0 0 * * * *',
        };
    }

    async subscribe() {
        const { ctx } = this;
        await ctx.service.utils.weixin.getAccessToken();
        await ctx.service.utils.weixin.getTicket();
    }
}
module.exports = Weixin;