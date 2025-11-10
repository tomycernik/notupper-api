import { supabase } from '@config/supabase';
import { Skin } from '@domain/interfaces/skin.interface';
import { ISkinRepository } from '@domain/repositories/skin.repository';
import { IPaginatedResult, IPaginationOptions } from '@domain/interfaces/pagination.interface';

export class SkinRepositorySupabase implements ISkinRepository {
  async getUserSkins(userId: string): Promise<Skin[]> {
    const { data, error } = await supabase
      .from('user_skin')
      .select(`
        skin:skin_id (
          id,
          name,
          description,
          image_url,
          preview_light,
          preview_dark,
          texture_set,
          price,
          included_in_plan,
          room_id,
          created_at
        )
      `)
      .eq('profile_id', userId);

    if (error) throw new Error(error.message);

    const skins = data?.map((item: any) => {
      const skin = item.skin;
      return {
        id: skin.id,
        name: skin.name,
        description: skin.description,
        imageUrl: skin.image_url,
        previewLight: skin.preview_light,
        previewDark: skin.preview_dark,
        price: skin.price,
        includedInPlan: skin.included_in_plan,
        createdAt: skin.created_at,
        roomId: skin.room_id,
        textureSet: skin.texture_set
      };
    }) || [];

    return skins;
  }

  async getAllSkins(pagination?: IPaginationOptions): Promise<IPaginatedResult<Skin>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = ((page - 1) * limit);

    // Obtener el total
    const { count, error: countError } = await supabase
      .from('skin')
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(countError.message);

    // Obtener los datos paginados
    const { data, error } = await supabase
      .from('skin')
      .select(`
        id,
        name,
        description,
        image_url,
        preview_light,
        preview_dark,
        texture_set,
        price,
        included_in_plan,
        room_id,
        created_at
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const skins = data?.map((skin: any) => ({
      id: skin.id,
      name: skin.name,
      description: skin.description,
      imageUrl: skin.image_url,
      previewLight: skin.preview_light,
      previewDark: skin.preview_dark,
      price: skin.price,
      includedInPlan: skin.included_in_plan,
      createdAt: skin.created_at,
      roomId: skin.room_id,
      textureSet: skin.texture_set
    })) || [];

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: skins,
      pagination: {
        currentPage: page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async getDefaultSkins(): Promise<Skin[]> {
    const { data, error } = await supabase
      .from('skins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const skins = (data as any)?.map((skin: any) => ({
      id: skin.id,
      name: skin.name,
      description: skin.description,
      imageUrl: skin.image_url,
      previewLight: skin.preview_light,
      previewDark: skin.preview_dark,
      price: skin.price,
      includedInPlan: skin.included_in_plan,
      createdAt: skin.created_at,
      roomId: skin.room_id,
      textureSet: skin.texture_set
    })) || [];

    return skins;
  }

  async findById(skinId: string): Promise<Skin | null> {
    const { data, error } = await supabase
      .from('skin')
      .select('*')
      .eq('id', skinId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      previewLight: data.preview_light,
      previewDark: data.preview_dark,
      price: data.price,
      includedInPlan: data.included_in_plan,
      createdAt: data.created_at,
      roomId: data.room_id,
      textureSet: data.texture_set
    };
  }

  async addSkinToUser(userId: string, skinId: string): Promise<void> {
    // Verificar que el skin existe
    const skin = await this.findById(skinId);
    if (!skin) {
      throw new Error('Skin no encontrada');
    }

    // Verificar si el usuario ya tiene este skin
    const { data: existing } = await supabase
      .from('user_skin')
      .select('profile_id')
      .eq('profile_id', userId)
      .eq('skin_id', skinId)
      .single();

    if (existing) {
      throw new Error('El usuario ya tiene este skin');
    }

    // Insertar la relación
    const { error } = await supabase
      .from('user_skin')
      .insert({
        profile_id: userId,
        skin_id: skinId
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  async getCompatibleSkins(roomId: string): Promise<Skin[]> {
    const { data, error } = await supabase
      .from('skin')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const skins = (data as any)?.map((skin: any) => ({
      id: skin.id,
      name: skin.name,
      description: skin.description,
      imageUrl: skin.image_url,
      previewLight: skin.preview_light,
      previewDark: skin.preview_dark,
      price: skin.price,
      includedInPlan: skin.included_in_plan,
      createdAt: skin.created_at,
      roomId: skin.room_id,
      textureSet: skin.texture_set
    })) || [];

    return skins;
  }

  async create(skin: Omit<Skin, 'id' | 'createdAt'>): Promise<Skin> {
    const { data, error } = await supabase
      .from('skins')
      .insert([{
        name: skin.name,
        description: skin.description,
        image_url: skin.imageUrl,
        preview_light: skin.previewLight,
        preview_dark: skin.previewDark,
        texture_set: skin.textureSet,
        price: skin.price,
        included_in_plan: skin.includedInPlan,
        room_id: skin.roomId
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      previewLight: data.preview_light,
      previewDark: data.preview_dark,
      price: data.price,
      includedInPlan: data.included_in_plan,
      createdAt: data.created_at,
      roomId: data.room_id,
      textureSet: data.texture_set
    };
  }

  async update(skinId: string, skin: Partial<Skin>): Promise<Skin> {
    const updateData: any = {};
    if (skin.name !== undefined) updateData.name = skin.name;
    if (skin.description !== undefined) updateData.description = skin.description;
    if (skin.imageUrl !== undefined) updateData.image_url = skin.imageUrl;
    if (skin.previewLight !== undefined) updateData.preview_light = skin.previewLight;
    if (skin.previewDark !== undefined) updateData.preview_dark = skin.previewDark;
    if (skin.textureSet !== undefined) updateData.texture_set = skin.textureSet;
    if (skin.price !== undefined) updateData.price = skin.price;
    if (skin.includedInPlan !== undefined) updateData.included_in_plan = skin.includedInPlan;
    if (skin.roomId !== undefined) updateData.room_id = skin.roomId;

    const { data, error } = await supabase
      .from('skins')
      .update(updateData)
      .eq('id', skinId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      previewLight: data.preview_light,
      previewDark: data.preview_dark,
      price: data.price,
      includedInPlan: data.included_in_plan,
      createdAt: data.created_at,
      roomId: data.room_id,
      textureSet: data.texture_set
    };
  }

  async delete(skinId: string): Promise<void> {
    const { error } = await supabase
      .from('skins')
      .delete()
      .eq('id', skinId);

    if (error) throw new Error(error.message);
  }

  async addCompatibleRoom(skinId: string, roomId: string): Promise<Skin> {
    const { error } = await supabase
      .from('rooms_compatible_skins')
      .insert([{ room_id: roomId, skin_id: skinId }]);

    if (error) throw new Error(error.message);

    const skin = await this.findById(skinId);
    if (!skin) throw new Error('Skin not found');
    return skin;
  }

  async removeCompatibleRoom(skinId: string, roomId: string): Promise<Skin> {
    const { error } = await supabase
      .from('rooms_compatible_skins')
      .delete()
      .eq('room_id', roomId)
      .eq('skin_id', skinId);

    if (error) throw new Error(error.message);

    const skin = await this.findById(skinId);
    if (!skin) throw new Error('Skin not found');
    return skin;
  }

  async setOwnershipStatus(skinId: string, userId: string, ownershipStatus: string): Promise<Skin> {
    if (ownershipStatus === 'owned') {
      const { error } = await supabase
        .from('user_skin')
        .insert([{ profile_id: userId, skin_id: skinId }]);

      if (error) throw new Error(error.message);
    } else if (ownershipStatus === 'not_owned') {
      const { error } = await supabase
        .from('user_skin')
        .delete()
        .eq('profile_id', userId)
        .eq('skin_id', skinId);

      if (error) throw new Error(error.message);
    } else {
      throw new Error('Invalid ownership status');
    }

    const skin = await this.findById(skinId);
    if (!skin) throw new Error('Skin not found');
    return skin;
  }
}