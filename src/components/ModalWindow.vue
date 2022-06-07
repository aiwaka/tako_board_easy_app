<template>
  <div class="modal-window">
    <button type="button" @click="openModal">
      <slot></slot>
    </button>
    <div class="modal-window__back" v-show="showContents" @click="closeModal">
      <div class="modal-window__contents">
        <div class="modal-window__contents--close-button" @click="closeModal">
          x
        </div>
        <img
          class="modal-window__contents--image"
          :src="imageURL"
          alt="表示できません"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive } from "vue";
import { getImageURL } from "@/composables/get-image";

interface State {
  imageURL: string;
  showContents: boolean;
}

export default defineComponent({
  props: {
    imageName: {
      type: String,
      required: true,
    },
  },
  emits: ["close-window"],
  setup(props) {
    const { imageURL, showContents } = toRefs(
      reactive<State>({ imageURL: "", showContents: false })
    );

    const closeModal = () => {
      showContents.value = false;
    };

    const openModal = async () => {
      if (imageURL.value === "") {
        imageURL.value = await getImageURL(props.imageName);
      }
      showContents.value = true;
    };

    return { closeModal, imageURL, openModal, showContents };
  },
});
</script>

<style lang="scss" scoped>
.modal-window {
  &__back {
    z-index: 10;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__contents {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    z-index: 11;
    max-width: 90%;
    max-height: 80%;
    width: fit-content;
    height: fit-content;
    padding: 0;

    &--close-button {
      line-height: 1rem;
      width: 1rem;
      height: 1rem;
      background-color: #bbb;
      cursor: pointer;
    }
    &--image {
      border: 4px double #ccc;
      max-height: 70vh;
      max-width: 80vw;
      aspect-ratio: auto;
    }
  }
}
</style>
