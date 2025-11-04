import { supabase } from '../../config/supabase';
import { Room } from '../../domain/interfaces/room.interface';
import { IRoomRepository } from '../../domain/repositories/room.repository';

export class RoomRepositorySupabase implements IRoomRepository {
  async getUserRooms(userId: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from('user_room')
      .select(`
        is_active,
        room:room_id (
          id,
          name,
          description,
          image_url,
          model_url,
          price,
          is_default,
          included_in_plan,
          created_at
        )
      `)
      .eq('profile_id', userId);

    if (error) throw new Error(error.message);

    const rooms = await Promise.all(data?.map(async (item: any) => {
      const room = item.room;

      const { data: compatibleSkinsData } = await supabase
        .from('skin')
        .select('id')
        .eq('room_id', room.id);

      const compatibleSkins = compatibleSkinsData?.map((s: any) => s.id) || [];

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        imageUrl: room.image_url,
        modelUrl: room.model_url,
        price: room.price,
        isDefault: room.is_default,
        includedInPlan: room.included_in_plan,
        createdAt: room.created_at,
        compatibleSkins,
        active: item.is_active || false
      };
    }) || []);

    return rooms;
  }

  async getDefaultRoom(): Promise<Room | null> {
    const { data, error } = await supabase
      .from('room')
      .select(`
        id,
        name,
        description,
        image_url,
        model_url,
        price,
        is_default,
        included_in_plan,
        created_at
      `)
      .eq('is_default', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    if (!data) return null;

    const { data: compatibleSkinsData } = await supabase
      .from('skin')
      .select('id')
      .eq('room_id', data.id);

    const compatibleSkins = compatibleSkinsData?.map((s: any) => s.id) || [];

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      modelUrl: data.model_url,
      price: data.price,
      isDefault: data.is_default,
      includedInPlan: data.included_in_plan,
      createdAt: data.created_at,
      compatibleSkins
    };
  }

  async findById(roomId: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('room')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return data as Room;
  }

  async create(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
    const { data, error } = await supabase
      .from('room')
      .insert([room])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Room;
  }

  async update(roomId: string, room: Partial<Room>): Promise<Room> {
    const { data, error } = await supabase
      .from('room')
      .update(room)
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Room;
  }

  async delete(roomId: string): Promise<void> {
    const { error } = await supabase
      .from('room')
      .delete()
      .eq('id', roomId);

    if (error) throw new Error(error.message);
  }

  async addCompatibleSkin(roomId: string, skinId: string): Promise<Room> {
    const { error } = await supabase
      .from('rooms_compatible_skins')
      .insert([{ room_id: roomId, skin_id: skinId }]);

    if (error) throw new Error(error.message);

    const room = await this.findById(roomId);
    if (!room) throw new Error('Room not found');
    return room;
  }

  async removeCompatibleSkin(roomId: string, skinId: string): Promise<Room> {
    const { error } = await supabase
      .from('rooms_compatible_skins')
      .delete()
      .eq('room_id', roomId)
      .eq('skin_id', skinId);

    if (error) throw new Error(error.message);

    const room = await this.findById(roomId);
    if (!room) throw new Error('Room not found');
    return room;
  }

  async getActiveRoom(userId: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('user_room')
      .select(`
        is_active,
        room:room_id (
          id,
          name,
          description,
          image_url,
          model_url,
          price,
          is_default,
          included_in_plan,
          created_at
        )
      `)
      .eq('profile_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data || !(data as any).room) {
      return null;
    }

    const room = (data as any).room;

    const { data: compatibleSkinsData } = await supabase
      .from('skins')
      .select('id')
      .eq('room_id', room.id);

    const compatibleSkins = compatibleSkinsData?.map((s: any) => s.id) || [];

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      imageUrl: room.image_url,
      modelUrl: room.model_url,
      price: room.price,
      isDefault: room.is_default,
      includedInPlan: room.included_in_plan,
      createdAt: room.created_at,
      active: true,
      compatibleSkins
    };
  }

  async setActiveRoom(userId: string, roomId: string): Promise<void> {
    const { data: userRoom } = await supabase
      .from('user_room')
      .select('room_id')
      .eq('profile_id', userId)
      .eq('room_id', roomId)
      .single();

    if (!userRoom) {
      throw new Error('El usuario no tiene acceso a esta habitación');
    }

    const { error: deactivateError } = await supabase
      .from('user_room')
      .update({ is_active: false })
      .eq('profile_id', userId);

    if (deactivateError) {
      throw new Error(deactivateError.message);
    }

    const { error: activateError } = await supabase
      .from('user_room')
      .update({ is_active: true })
      .eq('profile_id', userId)
      .eq('room_id', roomId);

    if (activateError) {
      throw new Error(activateError.message);
    }
  }
}