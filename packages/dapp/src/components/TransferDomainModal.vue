<template>
  <div class="action-modal">
    <v-modal ref="modal">
      <template v-slot:header>
        <h3>You're almost done</h3>
      </template>

      <template v-slot:body>
        <div class="modal-subtitle">
          <p>
            To finish the transaction, please check the informations above to
            ensure all itens are correct and confirm the transaction in Metamask
          </p>
        </div>
        <div class="modal-content">
          <div class="modal-row">
            <v-transfer-domain-form
              :tld="tld"
              :domain="domain"
              @domain-transfer-succeeded="notifySuccessfulTransfer"
              @domain-transfer-finished="closeModal"
            >
            </v-transfer-domain-form>
          </div>
        </div>
      </template>
    </v-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BaseModal from '@/components/BaseModal';
import TransferDomainForm from '@/components/TransferDomainForm';

export default {
  name: 'TransferDomainModal',
  components: {
    'v-modal': BaseModal,
    'v-transfer-domain-form': TransferDomainForm,
  },
  extends: BaseModal,
  props: {
    tld: {
      type: String,
      default: '',
    },
    domain: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    newOwnerAddress: '',
  }),
  computed: {
    ...mapGetters('validation', ['getErrorByType', 'getExceptionByType']),
  },
  methods: {
    openModal() {
      this.$refs.modal.openModal();
    },
    closeModal() {
      this.$refs.modal.closeModal();
    },
    notifySuccessfulTransfer(payload) {
      this.$emit('domain-transfer-succeeded', payload);
    },
  },
};
</script>

<style>
.action-modal .modal-container {
  width: 40vw;
}
.action-modal .modal-content .modal-row {
  text-align: left;
}
.action-modal .modal-content .modal-row h4 {
  margin: auto;
}
.action-modal .modal-row .row-wrapper {
  margin: 10px 0;
}
.action-modal .modal-row .row-content {
  display: inline-block;
  vertical-align: middle;
}
</style>
