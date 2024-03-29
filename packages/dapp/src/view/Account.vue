<template>
  <div class="container container--account">
    <div class="row row--full">
      <v-hero
        v-if="content.list_hero"
        :hero="content.list_hero"
        float="right"
        classes="colapsed"
      ></v-hero>
    </div>
    <div class="tab-menu">
      <v-actions-menu
        :actions="menuTabs"
        :activeTab="activeTab"
        @accountTabAction="handleTabChange"
        list-classes="tabs"
      />
    </div>
    <div class="list-domains">
      <ul class="list">
        <div v-if="!list[0] && activeTab == 'domain'">
          <h3>You don't have any domain. Try buying one first!</h3>
          <router-link to="/domain" class="btn btn--link btn--hero"
            >get your new domain</router-link
          >
        </div>

        <div v-if="!list[0] && activeTab == 'tld'">
          <h3>You don't have any Top Level Domain. Try buying one first!</h3>
          <router-link to="/tld" class="btn btn--link btn--hero"
            >get your new TLD</router-link
          >
        </div>

        <li v-for="(item, index) in list" :key="index" class="item">
          <v-card
            ref="card"
            :class="checkStatus(item.Expires)"
            card-type="full"
          >
            <template v-slot:header>
              <div class="title">
                <h3 class="name inline">{{ item.Name }}</h3>
                <h3 v-if="item.TLD" class="tld inline">.{{ item.TLD }}</h3>
              </div>
              <p v-if="item.StorageHash" class="hash">
                <strong>IPFS Hash:</strong> {{ item.StorageHash }}
              </p>
            </template>

            <template v-slot:body>
              <div class="due">
                <p class="due-title tooltip">Due Date:</p>
                <p class="due-value tooltip">{{ item.Expires | moment }}</p>
              </div>
              <div class="actions">
                <v-action-dropdown
                  ref="actionDropdown"
                  @cardAction="handleActions"
                  :element="item"
                  :actions="cardActions"
                  title="actions"
                  call-to-action="cardAction"
                />
              </div>
            </template>

            <template v-slot:footer>
              <p v-if="checkStatus(item.Expires) == 'alert'">
                This domain is expired
              </p>
              <p v-if="checkStatus(item.Expires) == 'warn'">
                This domain is close to expire
              </p>
            </template>
          </v-card>
        </li>
      </ul>
    </div>
    <div class="modal-tld">
      <v-renew-tld-modal
        ref="modalRenewTLD"
        :tld="selectedTld.name"
        @tld-renew-succeeded="reloadDomainsAndTlds"
      />

      <v-renew-domain-modal
        ref="modalRenewDomain"
        :tld="selectedDomain.tld"
        :domain="selectedDomain.domain"
        @domain-renew-succeeded="reloadDomainsAndTlds"
      />

      <v-tld-transfer-modal
        ref="modalTransferTld"
        @tld-transfer-succeeded="reloadDomainsAndTlds"
        :tld="selectedTld.name"
      />
    </div>
    <div class="modal-domain">
      <v-domain-transfer-modal
        ref="modalTransferDomain"
        @domain-transfer-succeeded="reloadDomainsAndTlds"
        :tld="selectedDomain.tld"
        :domain="selectedDomain.name"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import contentService from '@/api/contentService';
import Hero from '@/components/Hero';
import BaseCard from '@/components/BaseCard';
import ActionDropdown from '@/components/ActionDropdown';
import BaseActionsMenu from '@/components/BaseActionsMenu';
import RenewTLDModal from '@/components/RenewTLDModal';
import TransferTLDModal from '@/components/TransferTLDModal';
import TransferDomainModal from '@/components/TransferDomainModal';
import RenewDomainModal from '@/components/RenewDomainModal';
import { onEthereumChanged } from '@/utils/mixins';

const reloadOnChanges = onEthereumChanged('reloadDomainsAndTlds');

export default {
  name: 'Account',
  components: {
    'v-hero': Hero,
    'v-card': BaseCard,
    'v-action-dropdown': ActionDropdown,
    'v-actions-menu': BaseActionsMenu,
    'v-renew-tld-modal': RenewTLDModal,
    'v-renew-domain-modal': RenewDomainModal,
    'v-tld-transfer-modal': TransferTLDModal,
    'v-domain-transfer-modal': TransferDomainModal,
  },
  filters: {
    moment: date => new Date(date * 1000).toLocaleDateString(),
  },
  mixins: [reloadOnChanges],
  data() {
    return {
      content: [],
      activeTab: 'domain',
      listaTLD: [],
      availableActions: [
        {
          type: 'domain',
          actions: [
            {
              title: 'Renew',
              handler: 'handleRenewDomain',
              callToAction: 'cardAction',
            },
            {
              title: 'Transfer',
              handler: 'handleTransferDomain',
              callToAction: 'cardAction',
            },
            {
              title: 'Update',
              handler: 'updateDomain',
              callToAction: 'cardAction',
            },
          ],
        },
        {
          type: 'tld',
          actions: [
            {
              title: 'Renew',
              handler: 'handleRenewTld',
              callToAction: 'cardAction',
            },
            {
              title: 'Transfer',
              handler: 'handleTransferTld',
              callToAction: 'cardAction',
            },
          ],
        },
      ],
      cardActions: [],
      menuTabs: [
        {
          title: 'Domain',
          handler: 'domain',
          callToAction: 'accountTabAction',
        },
        {
          title: 'TLD',
          handler: 'tld',
          callToAction: 'accountTabAction',
        },
        // ,
        // { title: "Subdomain",
        //   handler: "subdomain",
        //   callToAction: "accountTabAction"
        // }
      ],
      selectedTld: {},
      selectedDomain: {},
    };
  },
  computed: {
    list() {
      switch (this.activeTab) {
        case 'tld':
          // TODO: refactor this
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.cardActions = this.availableActions.find(
            el => el.type === 'tld'
          ).actions;
          return this.topLevelDomains;
        case 'domain':
          // TODO: refactor this
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.cardActions = this.availableActions.find(
            el => el.type === 'domain'
          ).actions;
          return this.domains;
        // case "subdomain":
        //   this.cardActions = this.availableActions.find(el => el.type == "subdomain").actions
        //   return this.listSubDomains
        //   break;
        default:
          console.warn(
            "We couldn't find any " + event.action.handler + ' on our database'
          );
          return undefined;
      }
    },
    ...mapGetters(['topLevelDomains', 'domains']),
  },
  beforeMount: function() {
    contentService('account').then(response => {
      this.content = response.data;
    });

    this.$store.dispatch('resolveJanusNameService');
  },
  methods: {
    checkStatus: function(due) {
      const now = new Date();
      const expires = new Date(due * 1000);

      let differenceDate = 0;

      let status = 'alert';

      if (expires > now) {
        differenceDate = differenceInCalendarDays(expires, now);

        if (differenceDate <= 0) {
          status = 'alert';
        } else if (differenceDate > 0 && differenceDate <= 30) {
          status = 'warn';
        } else {
          status = 'success';
        }
      }

      return status;
    },
    handleTabChange(event) {
      this.activeTab = event.action.handler;
    },
    handleActions(event) {
      const { action, element } = event;
      this[action.handler](element);
    },
    handleRenewTld({ Name, Expires }) {
      this.selectedTld = { name: Name, expires: Expires };
      this.$refs.modalRenewTLD.openModal();
    },
    handleRenewDomain({ Name, TLD }) {
      this.selectedDomain = { domain: Name, tld: TLD };
      this.$refs.modalRenewDomain.openModal();
    },
    handleTransferTld({ Name, Expires }) {
      this.selectedTld = { name: Name, expires: Expires };
      this.$refs.modalTransferTld.openModal();
    },
    handleTransferDomain({ Name, TLD }) {
      this.selectedDomain = { name: Name, tld: TLD };
      this.$refs.modalTransferDomain.openModal();
    },
    reloadDomainsAndTlds() {
      this.$store.dispatch('loadAll');
    },
  },
};
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  margin: 10px 50px 140px;
}
.item {
  margin: 10px 0;
}
.item .hash {
  margin: 10px 0 0 0;
}
.due,
.actions {
  display: inline-block;
  vertical-align: middle;
}
.due {
  margin-right: 30px;
  text-align: left;
}
.due .tooltip {
  margin: 5px 0;
}
.tab-menu {
  margin: 20px 50px 0;
  text-align: left;
  border-bottom: 2px solid var(--color-gray-lighter);
}
</style>
