<template>
  <div id="page-create-point">
    <header>
      <img
        src="../assets/logo.svg"
        alt="Ecoleta"
      >
      <router-link to="/">
        <span>
          <arrow-left-icon size="1x" />
        </span>
        Voltar para Home
      </router-link>
    </header>

    <form @submit="handleSubmit">
      <h1>
        Cadastro do <br> ponto de coleta
      </h1>

      <DropZone @fileSelected="onFileUploaded" />

      <fieldset>
        <legend>
          <h2>Dados</h2>
        </legend>

        <div class="field">
          <label htmlFor="name">Nome da entidade</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            name="name"
            required
          >
        </div>

        <div class="field-group">
          <div class="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              name="email"
              required
            >
          </div>
          <div class="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input
              id="whatsapp"
              v-model="formData.whatsapp"
              type="text"
              name="whatsapp"
              required
            >
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <h2>Endereço</h2>
          <span>Selecione o endereço no mapa</span>
        </legend>

        <l-map
          :center="initialPosition"
          :zoom="15"
          @click="handleMapClick"
        >
          <l-tile-layer
            :attribution="attribution"
            :url="url"
          />

          <l-marker :lat-lng="selectPosition" />
        </l-map>

        <div class="field-group">
          <div class="field">
            <label htmlFor="uf">Estado (UF)</label>
            <select
              id="uf"
              v-model="selectedUF"
              name="uf"
              @change="fetchCities()"
            >
              <option value="0">
                Selecione uma UF
              </option>
              <option
                v-for="uf in ufs"
                :key="String(uf)"
                :value="uf"
              >
                {{ uf }}
              </option>
            </select>
          </div>
          <div class="field">
            <label htmlFor="cidade">Cidade</label>
            <select
              id="cidade"
              v-model="selectedCity"
              name="cidade"
            >
              <option value="0">
                Selecione uma cidade
              </option>
              <option
                v-for="city in cities"
                :key="String(city)"
                :value="city"
              >
                {{ city }}
              </option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <h2>Ítens de coleta</h2>
          <span>Selecione um ou mais itens abaixo</span>
        </legend>
        <ul class="items-grid">
          <li
            v-for="item in items"
            :key="item.id"
            :class="selectedItems.includes(item.id) ? 'selected' : ''"
            @click="handleSelectItem(item.id)"
          >
            <img
              :src="item.image_url"
              :alt="item.title"
            >
            <span>{{ item.title }}</span>
          </li>
        </ul>
      </fieldset>

      <button
        type="submit"
      >
        Cadastrar ponto de coleta
      </button>
    </form>
  </div>
</template>

<script>
import { ArrowLeftIcon } from 'vue-feather-icons';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import { latLng } from 'leaflet';
import DropZone from '@/components/DropZone.vue';
import axios from 'axios';
import api from '../services/api';

export default {
  name: 'CreatePoint',
  components: {
    ArrowLeftIcon,
    DropZone,
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      items: { id: Number, title: String, image_url: String },
      formData: { name: '', email: '', whatsapp: '' },
      ufs: [],
      cities: '',
      initialPosition: latLng(0, 0),
      selectedUF: '0',
      selectedCity: '0',
      selectPosition: latLng(0, 0),
      selectedItems: [],
      selectedFile: null,
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    };
  },
  mounted() {
    this.fetchGeolocation();
    this.fetchItems();
    this.fetchUFS();
  },
  methods: {
    fetchGeolocation() {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        this.initialPosition = latLng(latitude, longitude);
      });
    },
    fetchItems() {
      api.get('items').then((response) => {
        this.items = response.data;
      });
    },
    fetchUFS() {
      axios
        .get(
          'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
        )
        .then((response) => {
          const ufInitials = response.data.map((uf) => uf.sigla).sort();
          this.ufs = ufInitials;
        });
    },
    fetchCities() {
      console.log('aa');
      if (this.selectedUF === '0') {
        return;
      }
      axios
        .get(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${this.selectedUF}/municipios`,
        )
        .then((response) => {
          const cityNames = response.data.map((city) => city.nome).sort();
          this.cities = cityNames;
        });
    },
    handleMapClick(event) {
      console.log(event);
      this.selectPosition = [event.latlng.lat, event.latlng.lng];
    },
    handleSelectItem(id) {
      const alreadySelected = this.selectedItems.findIndex((item) => item === id);
      console.log(id);
      if (alreadySelected >= 0) {
        const filteredItems = this.selectedItems.filter((item) => item !== id);
        this.selectedItems = filteredItems;
      } else {
        this.selectedItems = [...this.selectedItems, id];
      }
    },
    onFileUploaded(file) {
      this.selectedFile = file;
    },
    async handleSubmit(event) {
      event.preventDefault();
      console.log('aaa');
      console.log(this.selectedFile);
      const uf = this.selectedUF;
      const city = this.selectedCity;
      const [latitude, longitude] = this.selectPosition;
      console.log(latitude, longitude);
      const items = this.selectedItems;

      const data = new FormData();

      data.append('name', this.formData.name);
      data.append('email', this.formData.email);
      data.append('whatsapp', this.formData.whatsapp);
      data.append('uf', uf);
      data.append('city', city);
      data.append('latitude', String(latitude));
      data.append('longitude', String(longitude));
      data.append('items', items.join(','));
      if (this.selectedFile) {
        data.append('image', this.selectedFile);
      }

      await api.post('points', data);
      // eslint-disable-next-line no-alert
      alert('Ponto de coleta criado!');
      this.$router.push('/');
    },
  },
};
</script>
<style lang="css" scoped>
#page-create-point {
  width: 100%;
  max-width: 1100px;

  margin: 0 auto;
}

#page-create-point header {
  margin-top: 48px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

#page-create-point header a {
  color: var(--title-color);
  font-weight: bold;
  text-decoration: none;

  display: flex;
  align-items: center;
}

#page-create-point header a svg {
  margin-right: 16px;
  color: var(--primary-color);
}

#page-create-point form {
  margin: 80px auto;
  padding: 64px;
  max-width: 730px;
  background: #FFF;
  border-radius: 8px;

  display: flex;
  flex-direction: column;
}

#page-create-point form h1 {
  font-size: 36px;
}

#page-create-point form fieldset {
  margin-top: 64px;
  min-inline-size: auto;
  border: 0;
}

#page-create-point form legend {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

#page-create-point form legend h2 {
  font-size: 24px;
}

#page-create-point form legend span {
  font-size: 14px;
  font-weight: normal;
  color: var(--text-color);
}

#page-create-point form .field-group {
  flex: 1;
  display: flex;
}

#page-create-point form .field {
  flex: 1;

  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

#page-create-point form .field input[type=text],
#page-create-point form .field input[type=email],
#page-create-point form .field input[type=number] {
  flex: 1;
  background: #F0F0F5;
  border-radius: 8px;
  border: 0;
  padding: 16px 24px;
  font-size: 16px;
  color: #6C6C80;
}

#page-create-point form .field select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  flex: 1;
  background: #F0F0F5;
  border-radius: 8px;
  border: 0;
  padding: 16px 24px;
  font-size: 16px;
  color: #6C6C80;
}

#page-create-point form .field input::placeholder {
  color: #A0A0B2;
}

#page-create-point form .field label {
  font-size: 14px;
  margin-bottom: 8px;
}

#page-create-point form .field :disabled {
  cursor: not-allowed;
}

#page-create-point form .field-group .field + .field {
  margin-left: 24px;
}

#page-create-point form .field-group input + input {
  margin-left: 24px;
}

#page-create-point form .field-check {
  flex-direction: row;
  align-items: center;
}

#page-create-point form .field-check input[type=checkbox] {
  background: #F0F0F5;
}

#page-create-point form .field-check label {
  margin: 0 0 0 8px;
}

#page-create-point form .leaflet-container {
  width: 100%;
  height: 350px;
  border-radius: 8px;
  margin-bottom: 24px;
}

#page-create-point form button {
  width: 260px;
  height: 56px;
  background: var(--primary-color);
  border-radius: 8px;
  color: #FFF;
  font-weight: bold;
  font-size: 16px;
  border: 0;
  align-self: flex-end;
  margin-top: 40px;
  transition: background-color 0.2s;
  cursor: pointer;
}

#page-create-point form button:hover {
  background: #2FB86E;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  list-style: none;
}

.items-grid li {
  background: #f5f5f5;
  border: 2px solid #f5f5f5;
  height: 180px;
  border-radius: 8px;
  padding: 32px 24px 16px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  text-align: center;

  cursor: pointer;
}

.items-grid li span {
  flex: 1;
  margin-top: 12px;

  display: flex;
  align-items: center;
  color: var(--title-color)
}

.items-grid li.selected {
  background: #E1FAEC;
  border: 2px solid #34CB79;
}
</style>
