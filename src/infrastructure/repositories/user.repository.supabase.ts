import { supabase } from "@config/supabase";
import { IMembership } from "@domain/interfaces/membership.interface";
import { IRepositoryUser, IUser } from "@domain/interfaces/user.interface";
import { IUserRepository } from "@domain/repositories/user.repository";
import { LoginDTO } from "@infrastructure/dtos/user/login.dto";

export class UserRepositorySupabase implements IUserRepository {
  async findUserAvatarUrlById(userId: string): Promise<string | null> {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) {
      console.error("Error obteniendo usuario:", error);
      return null;
    }
    const user = data.user;
    if (!user) return null;
    const avatarUrl = user.user_metadata?.avatar_url || null;

    return avatarUrl;
  }

  async findUserNameById(userId: string): Promise<string | null> {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) {
      console.error("Error obteniendo usuario:", error);
      return null;
    }
    const user = data.user;
    if (!user) return null;
    const name =
      user.user_metadata?.full_name || user.user_metadata?.name || null;

    return name;
  }
  async findByDreamNodeId(dreamNodeId: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from("dream_node")
      .select("profile:profile(*)")
      .eq("id", dreamNodeId)
      .single();

    if (error) {
      console.error("Error buscando usuario:", error);
      return null;
    }

    const profile = Array.isArray(data.profile)
      ? data.profile[0]
      : data.profile;

    return profile as IUser;
  }
  async register(user: IUser): Promise<IRepositoryUser> {
    const { email, password, date_of_birth: dateOfBirth } = user;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          date_of_birth: dateOfBirth.toISOString().split("T")[0],
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "No se pudo crear usuario");
    }

    // Asignar la room por defecto al nuevo usuario
    const { data: defaultRoom } = await supabase
      .from("room")
      .select("id")
      .eq("is_default", true)
      .single();

    if (defaultRoom) {
      await supabase.from("user_room").insert({
        profile_id: authData.user.id,
        room_id: defaultRoom.id,
        active: true,
      });

      const { data: defaultSkin } = await supabase
        .from("skin")
        .select("id")
        .eq("room_id", defaultRoom.id)
        .limit(1)
        .single();

      if (defaultSkin) {
        await supabase.from("user_skin").insert({
          profile_id: authData.user.id,
          skin_id: defaultSkin.id,
        });
      }
    }

    return {
      id: authData.user.id,
      email: user.email,
      name: user.name,
      date_of_birth: user.date_of_birth,
      token: authData.session?.access_token || null,
      coin_amount: 0,
    };
  }

  async login(userCredentials: LoginDTO): Promise<IRepositoryUser> {
    const { email, password } = userCredentials;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      throw new Error(error?.message || "No se pudo iniciar sesión");
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Error al obtener perfil: ${profileError.message}`);
    }

    if (!profileData) {
      throw new Error("No se encontró el perfil del usuario");
    }

    return {
      id: data.user.id,
      email: email,
      name: data.user.user_metadata?.name ?? null,
      date_of_birth: profileData.date_of_birth,
      coin_amount: profileData.coin_amount,
      token: data.session.access_token,
    };
  }

  async findById(id: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error buscando usuario:", error);
      return null;
    }

    return data as IUser;
  }

  async updateMembership(
    userId: string,
    membership: IMembership
  ): Promise<void> {
    const { error } = await supabase
      .from("profile")
      .update({
        membership_id: membership.membership_id,
        membership_start_date: membership.membership_start_date,
        membership_end_date: membership.membership_end_date,
      })
      .eq("id", userId);

    if (error) {
      console.error("Error actualizando membresía:", error);
      throw new Error("No se pudo actualizar la membresía");
    }
  }

  async addCoins(userId: string, amount: number): Promise<void> {
    const { data, error } = await supabase
      .from("profile")
      .select("coin_amount")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error obteniendo monedas:", error);
      throw new Error("No se pudieron obtener las monedas del usuario");
    }

    const newBalance = (data?.coin_amount ?? 0) + amount;

    const { error: updateError } = await supabase
      .from("profile")
      .update({ coin_amount: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("Error actualizando monedas:", updateError);
      throw new Error("No se pudieron actualizar las monedas");
    }
  }
}
