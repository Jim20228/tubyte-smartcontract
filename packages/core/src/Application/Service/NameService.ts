import { ethers, Contract } from 'ethers';
import { inject, injectable } from 'tsyringe';
import Helper from '../../Infra/Helper/ContractInstanceHelper';
import { Web3Provider } from 'ethers/providers';
import INameService from '../Interface/INameService';
import NameServiceConfig from '../../Domain/Entity/NameServiceConfig';
import { RequestResult } from '../../Domain/Entity/RequestResult';
import { ContractReceipt } from 'ethers/contract';
import { BuyDomainRequest } from '../../Domain/Entity/BuyDomainRequest';
import { DomainExistsRequest } from '../../Domain/Entity/DomainExistsRequest';
import { TopLevelDomain } from '../../Domain/Entity/TopLevelDomain';
import { ListDomainByOwnerResult } from '../../Domain/Entity/ListDomainByOwnerResult';

@injectable()
export default class NameService implements INameService {
  private _web3Provider: Web3Provider;
  private _smartContract: Contract;

  constructor(
    @inject('NameServiceConfig') private _jnsConfig: Required<NameServiceConfig>
  ) {
    if (!_jnsConfig.Web3Provider) {
      throw new Error('Missing Web3Provider');
    }

    this._web3Provider = new ethers.providers.Web3Provider(
      _jnsConfig.Web3Provider
    );
    this._smartContract = Helper.ContractInstance(
      this._web3Provider,
      _jnsConfig.SmartContractAddress,
      _jnsConfig.SmartcontractAbi
    );
  }

  public async BuyTLD(topLevelDomainName: string): Promise<RequestResult> {
    const newTLD = new RequestResult();

    const tx = await this._smartContract.registerTopDomain(topLevelDomainName);
    const receipt = await tx.wait();

    const events = (receipt as ContractReceipt).events;
    if (events) {
      newTLD.Success = true;
      newTLD.Result.push(...events);
    }

    return newTLD;
  }

  public IsTopDomainRegistered(topLevelDomainName: string): Promise<boolean> {
    return this._smartContract.topDomainAlreadyRegistered(topLevelDomainName);
  }

  // TODO: this is not sync!!! Check what it should do
  public IsTopDomainRegisteredSync(topLevelDomainName: string): any {
    this._smartContract
      .topDomainAlreadyRegistered(topLevelDomainName)
      .then((resp: boolean) => {
        return resp as boolean;
      });
    // return result;
  }

  public async RenewTLD(): Promise<never> {
    throw new Error('Method not implemented.');
  }

  public async TransferTLD(): Promise<never> {
    throw new Error('Method not implemented.');
  }

  public async ListTLDByOwner(): Promise<TopLevelDomain[]> {
    const listTLDByContract = await this._smartContract.getAllTopDomainsByOwner();
    const listTopLevelDomains = listTLDByContract[0].map(
      (tld: string, index: number) =>
        new TopLevelDomain(tld, parseInt(listTLDByContract[1][index], 10))
    );
    return listTopLevelDomains;
  }

  public async IsDomainRegisteredSync(
    request: DomainExistsRequest
  ): Promise<boolean> {
    return this._smartContract.domainAlreadyRegistered(
      request.Name,
      request.TLD
    );
  }

  public async BuyDomain(request: BuyDomainRequest): Promise<RequestResult> {
    const response = new RequestResult();

    const tx = await this._smartContract.registerDomain(
      request.Name,
      request.TLD,
      request.StorageHash
    );
    const receipt = await tx.wait();

    const events = (receipt as ContractReceipt).events;

    if (events) {
      response.Success = true;
      response.Result.push(...events);
    }

    return response;
  }

  public async RenewDomain(): Promise<never> {
    throw new Error('Method not implemented.');
  }

  public async TransferDomain(): Promise<never> {
    throw new Error('Method not implemented.');
  }

  public async ListDomainByOwner(): Promise<ListDomainByOwnerResult[]> {
    const tx = await this._smartContract.getAllDomainsByOwner();
    const result = tx[0].map(
      (name: string, index: number) =>
        new ListDomainByOwnerResult(
          name,
          tx[1][index],
          tx[2][index],
          parseInt(tx[3][index], 10)
        )
    );
    return result;
  }

  public async RegisterIPFS(): Promise<never> {
    throw new Error('Method not implemented.');
  }

  public async GetIPFSHashByDomain(domain: string): Promise<never> {
    throw new Error('Method not implemented.');
  }
}