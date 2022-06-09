<template>
  <div class="login-page">
    <div v-if="!state.loggedIn" class="login-form">
      <label>e-mail</label>：<input
        placeholder="name"
        v-model="state.userEmail"
      />
      <label>password</label>：<input
        placeholder="password"
        type="password"
        v-model="state.password"
      />
      <button @click="login">Login</button>
    </div>
    <div v-else>
      <button @click="logout">Logout</button>
    </div>
    <div v-if="state.loggedIn" class="login-name-display">
      {{ state.loginUserName }}としてログインしています。
    </div>
    <div v-if="state.errorMessage" class="error-msg">
      {{ state.errorMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/settings/firebase";
import { getUserName } from "@/composables/get-username";

interface State {
  errorMessage: string;
  loggedIn: boolean;
  loginUserName: string;
  password: string;
  userEmail: string;
}

export default defineComponent({
  setup() {
    const state = reactive<State>({
      errorMessage: "",
      loggedIn: false,
      loginUserName: "",
      password: "",
      userEmail: "",
    });
    const router = useRouter();
    const route = useRoute();

    onMounted(async () => {
      const userName = await getUserName();
      state.loggedIn = !!userName;
      if (userName !== null) {
        state.loginUserName = userName;
      }
    });

    const login = () => {
      signInWithEmailAndPassword(auth, state.userEmail, state.password)
        .then(() => {
          if (route.query.redirect) {
            const redirect = route.query.redirect;
            if (typeof redirect === "string") {
              router.push(redirect);
            } else {
              router.push("/");
            }
          } else {
            router.push("/");
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          state.errorMessage = `${errorCode}:${errorMessage}`;
        });
    };
    const logout = () => {
      if (confirm("ログアウトしますか？")) {
        signOut(auth)
          .then(() => {
            router.push("/");
          })
          .catch((error) => {
            state.errorMessage = error.message;
          });
      }
    };

    return { login, logout, state };
  },
});
</script>

<style lang="scss" scoped>
.login-name-display {
  width: 80%;
  margin: 16px auto;
}
</style>
