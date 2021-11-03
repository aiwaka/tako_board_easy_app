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
    <div v-if="state.errorMessage" class="error-msg">
      {{ state.errorMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, getCurrentUser } from "@/settings/firebase";

interface State {
  userEmail: string;
  password: string;
  errorMessage: string;
  loggedIn: boolean;
}

export default defineComponent({
  setup() {
    const state = reactive<State>({
      userEmail: "",
      password: "",
      errorMessage: "",
      loggedIn: false,
    });
    const router = useRouter();
    const route = useRoute();

    const login = () => {
      // eslint-disable-next-line no-console
      console.log("try to login");
      signInWithEmailAndPassword(auth, state.userEmail, state.password)
        .then((userCredential) => {
          const user = userCredential.user;
          alert(user);
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

    onMounted(async () => {
      const currentUser = await getCurrentUser();
      state.loggedIn = !!currentUser;
      if (state.loggedIn) {
        // eslint-disable-next-line no-console
        console.log(`user:${currentUser}`);
      } else {
        // eslint-disable-next-line no-console
        console.log("not logged in");
      }
    });

    return { state, login, logout };
  },
});
</script>
