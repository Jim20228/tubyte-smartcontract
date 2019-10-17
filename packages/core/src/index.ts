import Bootstrapper from './Infra/Bootstrapper';
import INameService from './Application/Interface/INameService';
import { Web3Provider } from 'ethers/providers';
import { RequestResult } from './Domain/Entity/RequestResult';
import TldValidator from './Application/Validator/TldValidator';
import NameServiceConfig from './Domain/Entity/NameServiceConfig';
import DomainValidator from './Application/Validator/DomainValidator';
import TransferTldValidator from './Application/Validator/TransferTldValidator';
import { BuyDomainRequest } from './Domain/Entity/BuyDomainRequest';
import { DomainExistsRequest } from './Domain/Entity/DomainExistsRequest';
import { RenewTldRequest } from './Domain/Entity/RenewTldRequest';
import { TransferTldRequest } from './Domain/Entity/TransferTldRequest';
import { RenewDomainRequest } from './Domain/Entity/RenewDomainRequest';

export class JanusNameService {
  public _jnsService: INameService;

  constructor(web3Provider: Web3Provider, contractAddress?: string) {
    Bootstrapper.RegisterServices(web3Provider, contractAddress);
    this._jnsService = Bootstrapper.Resolve<INameService>('INameService');
  }

  public async BuyTLD(tld: string): Promise<RequestResult> {
    tld = tld.toLowerCase();
    const config = Bootstrapper.Resolve<NameServiceConfig>('NameServiceConfig');

    const validator = new TldValidator(config);
    const result = new RequestResult();

    const validation = await validator.ValidateBuyTldRequest(tld);

    result.Success = validation.isValid();
    result.Errors = validation.getFailureMessages();

    if (result.Success) {
      return this._jnsService.BuyTLD(tld);
    } else {
      throw new Error(result.Errors[0].toString());
    }
  }

  public async TransferTLD(
    tld: string,
    newOwnerAddress: string
  ): Promise<RequestResult> {
    tld = tld.toLowerCase();

    const request: TransferTldRequest = {
      name: tld,
      newOwnerAddress,
    };

    const nameService = Bootstrapper.Resolve<INameService>('INameService');

    const validator = new TransferTldValidator(nameService);
    const validation = await validator.ValidateTransferTldRequest(request);

    const result = new RequestResult();

    result.Success = validation.isValid();
    result.Errors = validation.getFailureMessages();

    if (result.Success) {
      return this._jnsService.TransferTLD(request);
    } else {
      throw new Error(result.Errors[0].toString());
    }
  }

  public async BuyDomain(
    domain: string,
    tld: string,
    storageHash: string
  ): Promise<RequestResult> {
    domain = domain.toLocaleLowerCase();
    tld = tld.toLowerCase();

    const request = new BuyDomainRequest(domain, tld, storageHash);

    const config = Bootstrapper.Resolve<NameServiceConfig>('NameServiceConfig');

    const validator = new DomainValidator(config);
    const result = new RequestResult();

    const validation = await validator.ValidateNewDomainRequest(request);

    result.Success = validation.isValid();
    result.Errors = validation.getFailureMessages();

    if (result.Success) {
      const dealed = await this._jnsService.BuyDomain(request);
      return dealed;
    } else {
      throw new Error(result.Errors[0].toString());
    }
  }

  public async ListDomain(): Promise<RequestResult> {
    const result = new RequestResult();

    try {
      const list = await this._jnsService.ListDomainByOwner();
      if (list) {
        result.Success = true;
        result.Result = list;
      }
    } catch (error) {
      result.Errors.push(error);
    }

    return result;
  }

  public async ListTLD(): Promise<RequestResult> {
    const result = new RequestResult();

    try {
      const listTLDbyOwner = await this._jnsService.ListTLDByOwner();
      if (listTLDbyOwner) {
        result.Success = true;
        result.Result = listTLDbyOwner;
      }
    } catch (error) {
      result.Errors.push(error);
    }

    return result;
  }

  public async IsTldRegistered(tld: string): Promise<RequestResult> {
    const result = new RequestResult();

    try {
      const isTopDomainRegistered = await this._jnsService.IsTopDomainRegistered(
        tld
      );
      result.Success = true;
      result.Result = [{ IsTldRegistered: isTopDomainRegistered }];
    } catch (error) {
      result.Errors.push(error);
    }

    return result;
  }

  public async IsDomainRegistered(
    domain: string,
    tld: string
  ): Promise<RequestResult> {
    const result = new RequestResult();

    try {
      const isDomainRegistered = await this._jnsService.IsDomainRegisteredSync(
        new DomainExistsRequest(domain, tld)
      );
      result.Success = true;
      result.Result = [{ isDomainRegistered }];
    } catch (error) {
      result.Errors.push(error);
    }

    return result;
  }

  public async RenewTLD(tld: string): Promise<RequestResult> {
    tld = tld.toLowerCase();

    const request = new RenewTldRequest(tld);

    const config = Bootstrapper.Resolve<NameServiceConfig>('NameServiceConfig');

    const validator = new TldValidator(config);
    const result = new RequestResult();

    const validation = await validator.ValidateRenewTldRequest(request.tld);

    result.Success = validation.isValid();
    result.Errors = validation.getFailureMessages();

    if (result.Success) {
      try {
        const dealed = await this._jnsService.RenewTLD(request);
        return dealed;
      } catch (error) {
        throw new Error(error);
      }
    } else {
      throw new Error(result.Errors[0].toString());
    }
  }

  public async RenewDomain(
    domain: string,
    tld: string
  ): Promise<RequestResult> {
    domain = domain.toLocaleLowerCase();
    tld = tld.toLocaleLowerCase();

    const request = new RenewDomainRequest(domain, tld);

    const config = Bootstrapper.Resolve<NameServiceConfig>('NameServiceConfig');

    const validator = new DomainValidator(config);
    const validation = await validator.ValidateRenewDomainRequest(request);

    const result = new RequestResult();
    result.Success = validation.isValid();
    result.Errors = validation.getFailureMessages();

    if (result.Success) {
      try {
        const dealed = await this._jnsService.RenewDomain(request);
        return dealed;
      } catch (error) {
        throw new Error(error);
      }
    } else {
      throw new Error(result.Errors[0].toString());
    }
  }
}
