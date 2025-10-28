const BaseRepository = require('./BaseRepository');
const TicketStatusHistory = require('../models/TicketStatusHistory');

class TicketStatusHistoryRepository extends BaseRepository {
    constructor() {
        super(TicketStatusHistory);
    }

    async getHistoryByTicketId(ticketId) {
        return await this.model.getHistoryByTicketId(ticketId);
    }

    async getHistoryWithTicketInfo(ticketId) {
        return await this.model.getHistoryWithTicketInfo(ticketId);
    }

    async getRecentHistories(limit = 50) {
        return await this.model.getRecentHistories(limit);
    }

    async getHistoryStats() {
        return await this.model.getHistoryStats();
    }

    async getAverageResolutionTime() {
        return await this.model.getAverageResolutionTime();
    }

    async createHistory(ticketId, previousStatus, newStatus, comment, changedBy) {
        return await this.model.create({
            ticket_id: ticketId,
            previous_status: previousStatus,
            new_status: newStatus,
            comment: comment,
            changed_by: changedBy
        });
    }
}

module.exports = new TicketStatusHistoryRepository();
