<template>
  <AuthSplitShell :hero-props="heroProps">
    <template #right>
      <div class="w-full max-w-[420px]">
        <div class="mx-auto max-w-[420px]">
          <section class="flex flex-col gap-2">
            <p class="text-[13px] font-extrabold tracking-[0.32em] text-[#0000ff]">WELCOME BACK</p>
            <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-[#0000ff] sm:text-[2.7rem]">Chao mung tro lai!</h1>
            <p class="text-[1rem] leading-7 text-slate-500">Tao tai khoan VNSEEA cua ban!</p>
          </section>

          <section class="mt-7 flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-[0.95rem] font-semibold text-[#243b63]" for="welcome-login">Ten dang nhap (Dia chi email / So dien thoai)</label>
              <input id="welcome-login" v-model="login" type="text" class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-5 text-[1rem] text-slate-900 outline-none sm:h-[3.85rem] sm:rounded-[1.45rem]">
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between gap-4">
                <label class="text-[0.95rem] font-semibold text-[#243b63]" for="welcome-password">Mat khau</label>
                <NuxtLink class="text-[0.95rem] font-bold text-[#0000ff]" to="/forgot-password">Quen mat khau?</NuxtLink>
              </div>
              <div class="relative">
                <input id="welcome-password" v-model="password" :type="showPassword ? 'text' : 'password'" class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-5 pr-14 text-[1rem] text-slate-900 outline-none sm:h-[3.85rem] sm:rounded-[1.45rem]">
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" :aria-label="showPassword ? 'An mat khau' : 'Hien mat khau'" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                </button>
              </div>
            </div>

            <button class="h-[3.7rem] w-full rounded-[1.2rem] bg-[linear-gradient(180deg,#2749ff_0%,#0000ff_100%)] text-[1.05rem] font-black text-white shadow-[0_14px_32px_rgba(0,0,255,0.18)] sm:h-[3.95rem] sm:rounded-[1.45rem] sm:text-[1.15rem]" type="button" :disabled="loading" @click="handleLogin">
              <span v-if="loading" class="flex items-center justify-center gap-2"><Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" /> Đang đăng nhập...</span>
              <span v-else>Đăng nhập</span>
            </button>

            <p class="text-center text-[0.95rem] text-slate-500 sm:text-[1rem]">Không có tài khoản? <NuxtLink class="font-extrabold text-[#0000ff]" to="/register">Đăng ký</NuxtLink></p>
          </section>
        </div>
      </div>
    </template>
  </AuthSplitShell>
</template>

<script setup lang="ts">
const login = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const heroProps = {
  title: 'Chao mung tro lai!',
  subtitle: 'Tao tai khoan VNSEEA cua ban!',
}

const handleLogin = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 300))
  loading.value = false
}

useSeoMeta({ title: 'Dang nhap | VNSEEA' })
</script>
