import 'reflect-metadata';
import { Request, Response } from 'express';
import { FeedController } from '../../../../src/infrastructure/controllers/feed.controller';

describe('FeedController', () => {
  let controller: FeedController;
  let mockFeedService: any;
  let mockUserService: any;
  let mockNotificationService: any;
  let mockDreamNodeService: any;

  beforeEach(() => {
    mockFeedService = {
      getFeed: jest.fn(),
      likeNode: jest.fn(),
      unlikeNode: jest.fn()
    };

    mockUserService = {
      getUserIdByDreamNodeId: jest.fn(),
      getUserNameById: jest.fn(),
      getAvatarUrlById: jest.fn()
    };

    mockNotificationService = {
      saveNotification: jest.fn()
    };

    mockDreamNodeService = {
      getDreamNodeById: jest.fn()
    };

    controller = new FeedController(
      mockFeedService,
      mockUserService,
      mockNotificationService,
      mockDreamNodeService
    );
  });

  it('getFeed returns json on success', async () => {
    const req: Partial<Request> = { query: { page: '1' } };
    (req as any).userId = 'user-1';
    const mockRes: Partial<Response> = {
      json: jest.fn()
    };

    mockFeedService.getFeed.mockResolvedValue({ data: [], pagination: {} });

    await controller.getFeed(req as Request, mockRes as Response);

    expect(mockFeedService.getFeed).toHaveBeenCalledWith({ page: '1' }, 'user-1');
    expect(mockRes.json).toHaveBeenCalled();
  });

  it('getFeed returns 500 on service error', async () => {
    const req: Partial<Request> = { query: { page: '1' } };
    (req as any).userId = 'user-1';
    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockFeedService.getFeed.mockRejectedValue(new Error('fail'));
    await controller.getFeed(req as Request, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al obtener el feed',
      error: 'fail'
    });
  });

  it('likeNode validates missing data', async () => {
    const req: Partial<Request> = { body: {} };
    (req as any).userId = 'user-1';
    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await controller.likeNode(req as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('likeNode returns 500 if service fails', async () => {
    const req: Partial<Request> = { body: { dreamNodeId: 'node-1' } };
    (req as any).userId = 'user-1';
    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockFeedService.likeNode.mockRejectedValue(new Error('like error'));
    await controller.likeNode(req as Request, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al dar like'
    });
  });

  it('likeNode success path calls services and returns success', async () => {
    const req: Partial<Request> = { body: { dreamNodeId: 'node-1' } };
    (req as any).userId = 'user-1';

    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockFeedService.likeNode.mockResolvedValue(undefined);
    mockUserService.getUserIdByDreamNodeId.mockResolvedValue('owner-2');
    mockUserService.getUserNameById.mockResolvedValue('Alice');
    mockUserService.getAvatarUrlById.mockResolvedValue('avatar.png');
    mockDreamNodeService.getDreamNodeById.mockResolvedValue({ title: 'T' });

    await controller.likeNode(req as Request, mockRes as Response);

    expect(mockFeedService.likeNode).toHaveBeenCalledWith('node-1', 'user-1');
    expect(mockNotificationService.saveNotification).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
  });

  it('unlikeNode validates missing data', async () => {
    const req: Partial<Request> = { body: {} };
    (req as any).userId = 'user-1';
    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await controller.unlikeNode(req as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('unlikeNode returns 500 if service fails', async () => {
    const req: Partial<Request> = { body: { dreamNodeId: 'node-1' } };
    (req as any).userId = 'user-1';
    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockFeedService.unlikeNode.mockRejectedValue(new Error('unlike error'));
    await controller.unlikeNode(req as Request, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al quitar like'
    });
  });

  it('unlikeNode success returns 200', async () => {
    const req: Partial<Request> = { body: { dreamNodeId: 'node-1' } };
    (req as any).userId = 'user-1';
    const mockRes: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockFeedService.unlikeNode.mockResolvedValue(undefined);

    await controller.unlikeNode(req as Request, mockRes as Response);

    expect(mockFeedService.unlikeNode).toHaveBeenCalledWith('node-1', 'user-1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
  });
});