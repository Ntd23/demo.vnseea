<template>
  <AuthSplitShell :hero-props="heroProps">
    <template #right>
      <div class="w-full max-w-[420px]">
        <div class="mx-auto max-w-[420px]">
          <section class="flex flex-col gap-2">
            <p class="text-[13px] font-extrabold tracking-[0.32em] text-[#0000ff]">THAM GIA NGAY</p>
            <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-[#0000ff] sm:text-[2.7rem]">Tạo tài khoản</h1>
            <p class="text-[1rem] leading-7 text-slate-500">Đăng ký để kết nối với bạn bè trên VNSEEA.</p>
          </section>

          <section class="mt-7 flex flex-col gap-4">
            <div class="flex gap-3">
              <div class="field-group flex-1">
                <label class="field-label" for="register-firstname">Họ</label>
                <input id="register-firstname" class="field-input" placeholder="Nguyễn" type="text">
              </div>
              <div class="field-group flex-1">
                <label class="field-label" for="register-lastname">Tên</label>
                <input id="register-lastname" class="field-input" placeholder="Văn A" type="text">
              </div>
            </div>
            <div class="field-group">
              <label class="field-label" for="register-email">Email hoặc số điện thoại</label>
              <input id="register-email" class="field-input" autocomplete="username" placeholder="" type="text">
            </div>
            <div class="field-group">
              <label class="field-label" for="register-password">Mật khẩu mới</label>
              <div class="password-wrap">
                <input id="register-password" v-model="password" :type="showPassword ? 'text' : 'password'" class="field-input" autocomplete="new-password">
                <button class="password-toggle" type="button" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  <svg v-else fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
                </button>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Ngày sinh</label>
              <div class="flex gap-2">
                <select class="field-input flex-1 appearance-none px-3 py-2.5"><option value="">Ngày</option><option v-for="d in 31" :key="d" :value="d">{{ d }}</option></select>
                <select class="field-input flex-1 appearance-none px-3 py-2.5"><option value="">Tháng</option><option v-for="m in 12" :key="m" :value="m">Thg {{ m }}</option></select>
                <select class="field-input flex-1 appearance-none px-3 py-2.5"><option value="">Năm</option><option v-for="y in 50" :key="y" :value="2026 - y">{{ 2026 - y }}</option></select>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Giới tính</label>
              <div class="flex gap-3">
                <label class="flex flex-1 cursor-pointer items-center justify-between rounded-[10px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"><span class="text-[14px] font-medium text-slate-700">Nữ</span><input class="h-4 w-4 text-[#0000ff]" name="gender" type="radio" value="female"></label>
                <label class="flex flex-1 cursor-pointer items-center justify-between rounded-[10px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"><span class="text-[14px] font-medium text-slate-700">Nam</span><input class="h-4 w-4 text-[#0000ff]" name="gender" type="radio" value="male"></label>
                <label class="flex flex-1 cursor-pointer items-center justify-between rounded-[10px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"><span class="text-[14px] font-medium text-slate-700">Tùy chỉnh</span><input class="h-4 w-4 text-[#0000ff]" name="gender" type="radio" value="custom"></label>
              </div>
            </div>
            <button class="submit-button" type="button">Đăng ký</button>
            <p class="register-row">Đã có tài khoản? <NuxtLink class="register-link" to="/welcome">Đăng nhập</NuxtLink></p>
          </section>
        </div>
      </div>
    </template>
  </AuthSplitShell>
</template>

<script setup lang="ts">
const password = ref('')
const showPassword = ref(false)
const heroProps = {
  title: 'Tạo tài khoản!',
  subtitle: 'Đăng ký để kết nối với bạn bè trên VNSEEA.',
}
useSeoMeta({ title: 'Đăng ký | VNSEEA' })
</script>
