<template>
  <vue-dropzone
    id="dropzone"
    :options="dropzoneOptions"
    :include-styling="true"
    :use-custom-slot="true"
    class="dz-message"
    @vdropzone-thumbnail="thumbnail"
  >
    <p v-show="fileNotDroped">
      <uploadIcon />
      Imagem do estabelecimento
    </p>
  </vue-dropzone>
</template>
<script>
import vue2Dropzone from 'vue2-dropzone';
import { UploadIcon } from 'vue-feather-icons';

export default {
  name: 'App',
  components: {
    vueDropzone: vue2Dropzone,
    UploadIcon,
  },
  data() {
    return {
      dropzoneOptions: {
        url: 'https://httpbin.org/post',
        previewTemplate: this.template(),
        thumbnailWidth: null,
        thumbnailHeight: null,
        thumbnailMethod: 'contain',
        maxFiles: 2,
      },
      fileNotDroped: true,
    };
  },
  methods: {
    thumbnail(file, dataUrl) {
      let ref;
      if (file.previewElement) {
        ref = file.previewElement;
        ref.alt = file.name;
        ref.src = dataUrl;
        this.fileDroped = false;
      }
    },
    template() {
      return `
        <img src="aaaa" alt="Point Thumbnail" class="dz-message"/>
      `;
    },
  },
};
</script>
<style>
#dropzone {
  height: 300px;
  background: #e1faec;
  border-radius: 10px;

  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 48px;
  outline: 0;
}

#dropzone img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dz-message {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

#dropzone p{
  width: calc(100% - 60px);
  height: calc(100% - 60px);
  border-radius: 10px;
  border: 1px dashed #4ecb79;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #333;
}

#dropzone p svg {
  color: #4ecb79;
  width: 24px;
  height: 24px;
  margin-bottom: 8px;
}
</style>
