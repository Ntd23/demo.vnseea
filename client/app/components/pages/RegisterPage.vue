<template>
  <AuthSplitShell>
    <div class="mx-auto w-full max-w-[420px]">
      <section class="flex flex-col gap-2">
        <p class="text-[13px] font-extrabold tracking-[0.32em] text-[#0000ff]">ĐĂNG KÝ</p>
        <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-[#0000ff] sm:text-[2.7rem]">Tạo tài khoản VNSEEA của bạn!</h1>
        <p class="text-[1rem] leading-7 text-slate-500">Tạo Tài khoản VNSEEA của bạn!</p>
      </section>

      <section class="mt-7 flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-[0.95rem] font-semibold text-[#243b63]" for="register-username">Tên Người Dùng</label>
          <input id="register-username" class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-5 text-[1rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:h-[3.85rem] sm:rounded-[1.45rem]" placeholder="user_5" type="text">
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[0.95rem] font-semibold text-[#243b63]">Ngày sinh</label>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-4 text-[1rem] text-slate-900 outline-none transition focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:h-[3.85rem] sm:rounded-[1.45rem]"><option value="">ngày</option><option v-for="d in 31" :key="d" :value="d">{{ d }}</option></select>
            <select class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-4 text-[1rem] text-slate-900 outline-none transition focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:h-[3.85rem] sm:rounded-[1.45rem]"><option value="">tháng</option><option v-for="m in 12" :key="m" :value="m">{{ m }}</option></select>
            <select class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-4 text-[1rem] text-slate-900 outline-none transition focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:h-[3.85rem] sm:rounded-[1.45rem]"><option value="">năm</option><option v-for="y in 50" :key="y" :value="2026 - y">{{ 2026 - y }}</option></select>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[0.95rem] font-semibold text-[#243b63]" for="register-gender">Giới tính</label>
          <select id="register-gender" class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-5 text-[1rem] text-slate-900 outline-none transition focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:h-[3.85rem] sm:rounded-[1.45rem]">
            <option value="">Giới tính</option>
            <option value="female">Nữ</option>
            <option value="male">Nam</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[0.95rem] font-semibold text-[#243b63]" for="register-email">Tên đăng nhập (Địa chỉ email / Số điện thoại)</label>
          <input id="register-email" class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-[#edf4ff] px-5 text-[1rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:h-[3.85rem] sm:rounded-[1.45rem]" autocomplete="username" placeholder="user_5" type="text">
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[0.95rem] font-semibold text-[#243b63]" for="register-password">Mật khẩu</label>
          <div class="relative">
            <input id="register-password" v-model="password" :type="showPassword ? 'text' : 'password'" class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-[#edf4ff] px-5 pr-14 text-[1rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:h-[3.85rem] sm:rounded-[1.45rem]" autocomplete="new-password" placeholder="••••••">
            <button class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600" type="button" :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              <svg v-else fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="h-5 w-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
            </button>
          </div>
        </div>

        <div class="w-fit rounded-[2px] border border-slate-300 bg-white p-1 shadow-sm">
          <div class="flex h-[58px] w-[214px] items-center justify-between gap-3 px-2">
            <label class="flex items-center gap-2 text-[12px] text-slate-700">
              <input type="checkbox" class="h-[18px] w-[18px] rounded border-slate-400 text-[#0000ff] focus:ring-[#0000ff]">
              <span>I’m not a robot</span>
            </label>
            <div class="flex flex-col items-center justify-center text-[10px] leading-none text-slate-500">
              <div class="h-6 w-6 rounded-sm border border-[#d7e3ef] bg-[#f7fbff]"></div>
              <span class="mt-1">reCAPTCHA</span>
            </div>
          </div>
        </div>

        <label class="flex items-start gap-3 rounded-[1.15rem] border border-[#dbe3f2] bg-white p-4 sm:rounded-[1.45rem] sm:p-5">
          <input type="checkbox" class="mt-1 h-5 w-5 rounded border-slate-300 text-[#0000ff] focus:ring-[#0000ff]">
          <span class="text-[0.95rem] leading-7 text-slate-600 sm:text-[1rem]">
            Bạn là cửa hàng đã có sẵn địa điểm? <NuxtLink to="#" class="font-bold text-[#0000ff] underline-offset-2 hover:underline">Điều khoản sử dụng</NuxtLink> &amp; <NuxtLink to="#" class="font-bold text-[#0000ff] underline-offset-2 hover:underline">Chính sách bảo mật</NuxtLink>
          </span>
        </label>

        <label class="flex items-start gap-3 rounded-[1.15rem] border border-[#dbe3f2] bg-white p-4 sm:rounded-[1.45rem] sm:p-5">
          <input type="checkbox" class="mt-1 h-5 w-5 rounded border-slate-300 text-[#0000ff] focus:ring-[#0000ff]">
          <span class="text-[0.95rem] leading-7 text-slate-600 sm:text-[1rem]">
            Bằng cách tạo tài khoản của bạn, bạn đồng ý với <NuxtLink to="#" class="font-bold text-[#0000ff] underline-offset-2 hover:underline">Điều khoản sử dụng</NuxtLink> &amp; <NuxtLink to="#" class="font-bold text-[#0000ff] underline-offset-2 hover:underline">Chính sách bảo mật</NuxtLink>
          </span>
        </label>

        <button class="h-[3.7rem] w-full rounded-[1.2rem] bg-[linear-gradient(180deg,#5e5cff_0%,#5a56ff_100%)] text-[1.05rem] font-black text-white shadow-[0_14px_32px_rgba(90,86,255,0.22)] transition hover:brightness-105 sm:h-[3.95rem] sm:rounded-[1.45rem] sm:text-[1.15rem]" type="button">Đi nào !</button>
        <p class="text-center text-[0.95rem] text-slate-500 sm:text-[1rem]">Bạn có sẵn sàng để tạo một tài khoản? <NuxtLink class="font-extrabold text-[#0000ff]" to="/welcome">Đăng nhập</NuxtLink></p>
      </section>
    </div>
  </AuthSplitShell>
</template>

<script setup lang="ts">
const password = ref('')
const showPassword = ref(false)
</script>
