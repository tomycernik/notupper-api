import { DreamTypeName, Emotion, EmotionOption, IDreamNode } from "@domain/models/dream-node.model";
import { IDreamNodeRepository } from "@domain/repositories/dream-node.repository";
import { supabase } from "@config/supabase";
import { IDreamNodeEntity } from "@infrastructure/entities/dream-node.entity";
import { privacyMap, stateMap, emotionMap, dreamTypeMap } from "@config/mappings";
import { IDreamNodeFilters } from "@domain/interfaces/dream-node-filters.interface";
import { IPaginationOptions } from "@domain/interfaces/pagination.interface";
import { IDreamContext } from "@domain/interfaces/dream-context.interface";
import { DreamGraphResponse } from "@/domain/interfaces/dream-map-item.interface";

export class DreamNodeRepositorySupabase implements IDreamNodeRepository {
  async save(
    dreamNode: IDreamNode,
    userId: string,
    dreamType: DreamTypeName
  ): Promise<{ data: any; error: Error | null }> {
    const dreamNodeEntity: IDreamNodeEntity = {
      ...(dreamNode.id ? { id: dreamNode.id } : {}),
      profile_id: userId,
      title: dreamNode.title,
      dream_description: dreamNode.dream_description,
      interpretation: dreamNode.interpretation,
      creation_date: dreamNode.creationDate,
      privacy_id: privacyMap[dreamNode.privacy]!,
      state_id: stateMap[dreamNode.state]!,
      emotion_id: emotionMap[dreamNode.emotion]!,
      image_url: dreamNode.imageUrl ?? '',
      dream_type_id: dreamTypeMap[dreamType]!,
    };
    const { data,  error  } = await supabase
      .from("dream_node")
      .insert(dreamNodeEntity)
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

 async getUserNodes(
    userId: string,
    filters?: IDreamNodeFilters,
    pagination?: IPaginationOptions
  ): Promise<IDreamNode[]> {
    let query = supabase
      .from("dream_node")
      .select("*, dream_type:dream_type_id(*), emotion:emotion_id(*)")
      .eq("profile_id", userId);

    if (filters?.state) {
      const stateId = stateMap[filters.state];
      if (stateId) query = query.eq("state_id", stateId);
    }

    if (filters?.privacy) {
      const privacyId = privacyMap[filters.privacy];
      if (privacyId) query = query.eq("privacy_id", privacyId);
    }

    if (filters?.emotion) {
      const emotionId = emotionMap[filters.emotion];
      if (emotionId) query = query.eq("emotion_id", emotionId);
    }

    if (filters?.dreamType) {
      const dreamTypeId = dreamTypeMap[filters.dreamType];
      if (dreamTypeId) query = query.eq("dream_type_id", dreamTypeId);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm}`);
    }

    if (filters?.from) {
      query = query.gte("creation_date", filters.from);
    }

    if (filters?.to) {
      query = query.lte("creation_date", filters.to);
    }

    query = query.order("creation_date", { ascending: false });

    if (pagination?.offset !== undefined && pagination?.limit !== undefined) {
      const to = pagination.offset + pagination.limit - 1;
      query = query.range(pagination.offset, to);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const dreamIds = data.map((node: any) => node.id);

    const getContextLabels = async (
      table: string,
      joinTable: string
    ): Promise<Map<string, string[]>> => {
      const { data: contextData, error: contextError } = await supabase
        .from(joinTable)
        .select(`dream_id, ${table}!inner(label)`)
        .in('dream_id', dreamIds);

      if (contextError) {
        console.error(`Error fetching ${joinTable}:`, contextError);
        return new Map();
      }

      const contextMap = new Map<string, string[]>();

      contextData?.forEach((item: any) => {
        const dreamId = item.dream_id;

        let label: string | undefined;
        for (const key in item) {
          if (key !== 'dream_id' && item[key]?.label) {
            label = item[key].label;
            break;
          }
        }

        if (label) {
          if (!contextMap.has(dreamId)) {
            contextMap.set(dreamId, []);
          }
          contextMap.get(dreamId)!.push(label);
        }
      });

      return contextMap;
    };

    const [emotionContexts, locationContexts, peopleContexts, themeContexts] =
      await Promise.all([
        getContextLabels('profile_emotion_context', 'dream_emotion_context'),
        getContextLabels('profile_location', 'dream_location'),
        getContextLabels('profile_person', 'dream_person'),
        getContextLabels('profile_theme', 'dream_theme'),
      ]);

    const dreamNodes = data.map((node: any) => ({
      id: node.id,
      title: node.title,
      dream_description: node.description,
      interpretation: node.interpretation,
      imageUrl: node.image_url,
      creationDate: new Date(node.creation_date),
      privacy: node.privacy,
      state: node.state,
      emotion: node.emotion?.emotion || null,
      emotionColor: node.emotion?.color || null,
      type: node.dream_type?.dream_type_name || node.type,
      emotion_context: emotionContexts.get(node.id) || [],
      location_context: locationContexts.get(node.id) || [],
      people_context: peopleContexts.get(node.id) || [],
      theme_context: themeContexts.get(node.id) || [],
    }));

    return dreamNodes;
  }

  async countUserNodes(
    userId: string,
    filters?: IDreamNodeFilters
  ): Promise<number> {
    let query = supabase
      .from("dream_node")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId);

    if (filters?.state) {
      const stateId = stateMap[filters.state];
      if (stateId) query = query.eq("state_id", stateId);
    }

    if (filters?.privacy) {
      const privacyId = privacyMap[filters.privacy];
      if (privacyId) query = query.eq("privacy_id", privacyId);
    }

    if (filters?.emotion) {
      const emotionId = emotionMap[filters.emotion];
      if (emotionId) query = query.eq("emotion_id", emotionId);
    }

    if (filters?.dreamType) {
      const dreamTypeId = dreamTypeMap[filters.dreamType];
      if (dreamTypeId) query = query.eq("dream_type_id", dreamTypeId);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm}`);
    }

    if (filters?.from) {
      query = query.gte("creation_date", filters.from);
    }

    if (filters?.to) {
      query = query.lte("creation_date", filters.to);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  async getDreamNodeById(dreamNodeId: string): Promise<IDreamNode | null> {

    const { data, error } = await supabase
      .from("dream_node")
      .select("*")
      .eq("id", dreamNodeId)
      .single();

    if (error || !data) {
      return null;
    }

    const [privacyData, stateData, emotionData, dreamTypeData] = await Promise.all([
      supabase.from("dream_privacy").select("privacy_description").eq("id", data.privacy_id).single(),
      supabase.from("dream_state").select("state_description").eq("id", data.state_id).single(),
      supabase.from("emotion").select("emotion").eq("id", data.emotion_id).single(),
      supabase.from("dream_type").select("dream_type_name").eq("id", data.dream_type_id).single(),
    ]);

    const result = {
      id: data.id,
      title: data.title,
      dream_description: data.dream_description,
      interpretation: data.interpretation,
      imageUrl: data.image_url,
      creationDate: new Date(data.creation_date),
      privacy: privacyData.data?.privacy_description || "Privado",
      state: stateData.data?.state_description || "Activo",
      emotion: emotionData.data?.emotion || null,
      type: dreamTypeData.data?.dream_type_name || "Estandar",
    };
    return result;
  }

   async getUserDreamContext(userId: string): Promise<IDreamContext> {
    const { data, error } = await supabase.rpc("get_user_context", {
      params: { user_id: userId },
    });

    if (error) {
      console.error("Error getting user context:", error);
      return {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
    }

    return data as IDreamContext;
  }

  async addDreamContext(
    dreamNodeId: string,
    userId: string,
    context: IDreamContext
  ) {
    const { themes, people, locations, emotions_context } = context;

    if (themes?.length) {
      for (const theme of themes) {
        const { data: existingTheme } = await supabase
          .from("profile_theme")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", theme.label)
          .single();

        const themeId =
          existingTheme?.id ??
          (
            await supabase
              .from("profile_theme")
              .insert({ profile_id: userId, label: theme.label })
              .select("id")
              .single()
          ).data?.id;

        if (!themeId) throw new Error("No se pudo obtener el ID del theme");

        await supabase
          .from("dream_theme")
          .insert({
            dream_id: dreamNodeId,
            theme_id: themeId,
          })
          .throwOnError();
      }
    }

    if (people?.length) {
      for (const person of people) {
        const { data: existingPerson } = await supabase
          .from("profile_person")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", person.label)
          .single();

        const personId =
          existingPerson?.id ??
          (
            await supabase
              .from("profile_person")
              .insert({ profile_id: userId, label: person.label })
              .select("id")
              .single()
          ).data?.id;

        if (!personId) throw new Error("No se pudo obtener el ID del person");

        await supabase
          .from("dream_person")
          .insert({
            dream_id: dreamNodeId,
            person_id: personId,
          })
          .throwOnError();
      }
    }

    if (locations?.length) {
      for (const location of locations) {
        const { data: existingLocation } = await supabase
          .from("profile_location")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", location.label)
          .single();

        const locationId =
          existingLocation?.id ??
          (
            await supabase
              .from("profile_location")
              .insert({ profile_id: userId, label: location.label })
              .select("id")
              .single()
          ).data?.id;

        if (!locationId)
          throw new Error("No se pudo obtener el ID del location");

        await supabase
          .from("dream_location")
          .insert({
            dream_id: dreamNodeId,
            location_id: locationId,
          })
          .throwOnError();
      }
    }

    if (emotions_context?.length) {
      for (const emotion of emotions_context) {
        const { data: existingEmotion } = await supabase
          .from("profile_emotion_context")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", emotion.label)
          .single();

        const emotionId =
          existingEmotion?.id ??
          (
            await supabase
              .from("profile_emotion_context")
              .insert({ profile_id: userId, label: emotion.label })
              .select("id")
              .single()
          ).data?.id;

        if (!emotionId) throw new Error("No se pudo obtener el ID del emotion");

        await supabase
          .from("dream_emotion_context")
          .insert({
            dream_id: dreamNodeId,
            emotion_context_id: emotionId,
          })
          .throwOnError();
      }
    }
  }

  async updateDreamNode(
  nodeId: string,
  userId: string,
  updates: Partial<Pick<IDreamNode, 'state' | 'privacy'>>
): Promise<{ data: any; error: Error | null }> {
  try {
    const updateData: any = {};

    if (updates.state !== undefined) {
      updateData.state_id = stateMap[updates.state];
    }

    if (updates.privacy !== undefined) {
      updateData.privacy_id = privacyMap[updates.privacy];
    }

    if (Object.keys(updateData).length === 0) {
      return { data: null, error: new Error('No fields to update') };
    }

    const { data, error } = await supabase
      .from('dream_node')
      .update(updateData)
      .eq('id', nodeId)
      .eq('profile_id', userId)
      .select('id, state_id, privacy_id')
      .single();

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        state: Object.keys(stateMap).find(key => stateMap[key] === data.state_id),
        privacy: Object.keys(privacyMap).find(key => privacyMap[key] === data.privacy_id),
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

async getAllEmotions(): Promise<EmotionOption[]> {
  const { data, error } = await supabase
    .from("emotion")
    .select("id, emotion, color")
    .order("emotion", { ascending: true });
    if (error) {
      console.error("Error fetching emotions:", error);
      throw new Error(error.message);
    }
    return (data ?? []).map((row: any) => ({id: row.id, label: row.emotion as Emotion}));
  }

  async countLikes(dreamNodeId: string): Promise<number> {
    const { count, error } = await supabase
      .from('dream_node_like')
      .select('*', { count: 'exact', head: true })
      .eq('dream_node_id', dreamNodeId);
    if (error) throw new Error(error.message);
    return count || 0;
  }

  async isLikedByUser(dreamNodeId: string, profileId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('dream_node_like')
      .select('*', { count: 'exact', head: true })
      .eq('dream_node_id', dreamNodeId)
      .eq('profile_id', profileId);
    if (error) throw new Error(error.message);
    return (count || 0) > 0;
  }

  async like(dreamNodeId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('dream_node_like')
      .upsert({ dream_node_id: dreamNodeId, profile_id: profileId });
    if (error) throw new Error(error.message);
  }

  async unlike(dreamNodeId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('dream_node_like')
      .delete()
      .eq('dream_node_id', dreamNodeId)
      .eq('profile_id', profileId);
    if (error) throw new Error(error.message);
  }

  async getPublicDreams(pagination: IPaginationOptions, currentUserId?: string): Promise<any[]> {
    let query = supabase
      .from("dream_node")
      .select(`*, emotion:emotion_id(id, emotion, color)`)
      .eq("privacy_id", privacyMap["Publico"])
      .order("creation_date", { ascending: false });

    if (pagination?.offset !== undefined && pagination?.limit !== undefined) {
      const to = pagination.offset + pagination.limit - 1;
      query = query.range(pagination.offset, to);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    return await Promise.all(
      (data ?? []).map(async (node: any) => {
        const { data: userData } = await supabase.auth.admin.getUserById(node.profile_id);
        // Contar likes y si el usuario autenticado dio like
        const likeCount = await this.countLikes(node.id);
        const likedByMe = currentUserId ? await this.isLikedByUser(node.id, currentUserId) : false;
        return {
          id: node.id,
          title: node.title,
          dream_description: node.dream_description,
          interpretation: node.interpretation,
          creationDate: node.creation_date,
          imageUrl: node.image_url,
          profile_id: node.profile_id,
          userName: userData?.user?.user_metadata?.username || userData?.user?.email?.split('@')[0] || 'Usuario',
          fotoUser: userData?.user?.user_metadata?.avatar_url || null,
          likeCount,
          likedByMe,
          // commentCount: 0
          colorEmotion: node.emotion?.color || null,
          emotion: node.emotion?.emotion || null,
          isOwner: currentUserId ? node.profile_id === currentUserId : false,
        };
      })
    );
  }

  async countPublicDreams(): Promise<number> {
    const { count, error } = await supabase
      .from("dream_node")
      .select("*", { count: "exact", head: true })
      .eq("privacy_id", privacyMap["Publico"]);

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  async getUserDreamMap(userId: string): Promise<DreamGraphResponse> {
    try {
      const { data, error } = await supabase.rpc("get_dream_graph", {
        user_id: userId,
      });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (error: any) {
      throw new Error(`Error al obtener el mapa de sueños: ${error.message}`);
    }
  }
}