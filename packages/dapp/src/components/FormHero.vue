<template>
  <form @submit.prevent="handleSubmit" class="form form--hero shadow--dark">
    <div class="form_content form_content--body">
      <slot></slot>
    </div>
    <div class="form_content form_content--actions">
      <button class="btn" type="submit">{{ action.title }}</button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'FormHero',
  components: {},
  props: {
    action: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {},
  mounted() {},
  methods: {
    handleSubmit: function(event) {
      this.$emit(this.action.handler, { action: this.action, event: event });
    },
  },
};
</script>

<style>
.form--hero {
  display: flex;
  justify-content: space-between;
  padding: 30px;
  background: white;
}
.form--hero .form_content {
  display: inline-block;
  position: relative;
}
.form--hero .form_content .field_content {
  margin: 0;
}
.form--hero .form_content .field_label {
  color: var(--color-gray);
  font-weight: 500;
}
.form--hero .form_content--body {
  flex-grow: 1;
}
.form--hero .form_content--actions {
  padding: 36px 0 0 20px;
  text-align: right;
}
.form--hero .form_content--actions .btn {
  height: 54px;
}
.form--hero .errors p {
  margin-bottom: 0;
}
.form--hero.colapsed {
  background: transparent;
  box-shadow: none;
  padding: 0;
}
.form--hero.colapsed .field_label,
.form--hero.colapsed .errors p {
  color: white;
}
</style>
