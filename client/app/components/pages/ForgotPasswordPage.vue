<template>
  <AuthSplitShell>
    <div class="mx-auto w-full max-w-[420px]">
      <section class="flex flex-col gap-2">
        <p class="text-[13px] font-extrabold tracking-[0.32em] text-[#0000ff]">KHÔI PHỤC TÀI KHOẢN</p>
        <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-[#0000ff] sm:text-[2.7rem]">Quên mật khẩu?</h1>
        <p class="text-[1rem] leading-7 text-slate-500">Nhập email hoặc số điện thoại để nhận liên kết đặt lại mật khẩu.</p>
      </section>

      <section class="mt-7 flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="reset-email" class="text-[0.95rem] font-semibold text-[#243b63]">E-mail</label>
          <input id="reset-email" v-model="email" type="email" autocomplete="email" class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-5 text-[1rem] text-slate-900 outline-none transition placeholder:text-slate-400 sm:h-[3.85rem] sm:rounded-[1.45rem]">
        </div>

        <div class="rounded-[1.15rem] border border-[#dbe3f2] bg-white p-4 sm:rounded-[1.45rem] sm:p-5">
          <div class="flex items-center justify-between gap-4">
            <label class="flex items-center gap-3 text-[0.95rem] text-[#243b63]">
              <input type="checkbox" class="h-5 w-5 rounded border-slate-300 text-[#0000ff] focus:ring-[#0000ff]">
              <span>Tôi không phải robot</span>
            </label>
            <div class="flex flex-col items-center justify-center text-[10px] leading-none text-slate-500">
              <div class="h-7 w-7 rounded-sm border border-[#d7e3ef] bg-[#f7fbff]"></div>
              <span class="mt-1">reCAPTCHA</span>
            </div>
          </div>
        </div>

        <button class="h-[3.7rem] w-full rounded-[1.2rem] bg-[linear-gradient(180deg,#2749ff_0%,#0000ff_100%)] text-[1.05rem] font-black text-white shadow-[0_14px_32px_rgba(0,0,255,0.18)] transition hover:brightness-105 sm:h-[3.95rem] sm:rounded-[1.45rem] sm:text-[1.15rem]" type="button">Hồi phục</button>

        <p class="text-center text-[0.95rem] text-slate-500 sm:text-[1rem]">
          Bạn đã nhớ mật khẩu?
          <NuxtLink to="/welcome" class="font-extrabold text-[#0000ff]">Đăng nhập</NuxtLink>
        </p>
      </section>
    </div>
  </AuthSplitShell>
</template>

<script setup lang="ts">
const email = ref('')
</script>
