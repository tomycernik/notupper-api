"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const envs_1 = require("./envs");
exports.supabase = (0, supabase_js_1.createClient)(envs_1.envs.SUPABASE_URL, envs_1.envs.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
//# sourceMappingURL=supabase.js.map