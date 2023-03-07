/**
 * Returns the id of the CustomerSuccess with the most customers
 * @param {array} customerSuccess
 * @param {array} customers
 * @param {array} customerSuccessAway
 */

const ValidationErrors = {
  CS_LENGTH: "number of CSs allowed",
  CS_AWAY: "number of CSs away allowed",
  CS_ALLOWED_IDS: "value to CS ID",
  CS_ALLOWED_SCORES: "value to CS score",
  CS_DIFFERENT_SCORES: "scores of CSs, they should be different",
  CUSTOMER_LENGTH: "number of customers",
  CUSTOMER_ALLOWED_ID: "value to customer ID",
  CUSTOMER_ALLOWED_SCORE: "value to customer score",
};

const maxCsLength = 1000;
const maxCustomersLength = 1000000;
const maxCsId = 1000;
const maxCsScore = 10000;
const maxCustomerId = 1000000;
const maxCustomerScore = 100000;

function getMaxCsAway(customerSuccess) {
  const n = customerSuccess.length;
  return Math.floor(n / 2);
}

function customerSuccessBalancing(
  customerSuccess,
  customers,
  customerSuccessAway
) {
  const isInputsValid = validateInputs(
    customerSuccess,
    customers,
    customerSuccessAway
  );

  if (isInputsValid) {
    const availableCustomerSuccess = customerSuccess.filter(
      (cs) => !customerSuccessAway.includes(cs.id)
    );

    const availableCsSortedByScore = availableCustomerSuccess.sort(
      (a, b) => a.score - b.score
    );

    const customersByScore = customers.sort((a, b) => a.score - b.score);

    const csCustomers = {};
    for (let cs of availableCsSortedByScore) {
      csCustomers[cs.id] = [];
    }

    for (let customer of customersByScore) {
      let assigned = false;
      for (let cs of availableCsSortedByScore) {
        if (cs.score >= customer.score) {
          csCustomers[cs.id].push(customer.id);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        // For instance, customers may be left without a CS assigned
        continue;
      }
    }

    const csMaxCustomersCount = Object.entries(csCustomers).reduce(
      (acc, [key, value]) => {
        const customersLength = value.length;
        if (customersLength > acc.max) {
          return { key, max: customersLength };
        } else if (customersLength === acc.max) {
          // If there is a tie, returns 0
          return { key: 0, max: customersLength };
        } else {
          return acc;
        }
      },
      { key: "", max: -Infinity }
    );

    return parseInt(csMaxCustomersCount.key);
  }
}

test("Scenario 1", () => {
  const css = [
    { id: 1, score: 60 },
    { id: 2, score: 20 },
    { id: 3, score: 95 },
    { id: 4, score: 75 },
  ];
  const customers = [
    { id: 1, score: 90 },
    { id: 2, score: 20 },
    { id: 3, score: 70 },
    { id: 4, score: 40 },
    { id: 5, score: 60 },
    { id: 6, score: 10 },
  ];
  const csAway = [2, 4];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

function buildSizeEntities(size, score) {
  const result = [];
  for (let i = 0; i < size; i += 1) {
    result.push({ id: i + 1, score });
  }
  return result;
}

function mapEntities(arr) {
  return arr.map((item, index) => ({
    id: index + 1,
    score: item,
  }));
}

function arraySeq(count, startAt) {
  return Array.apply(0, Array(count)).map((it, index) => index + startAt);
}

function validateInputs(customerSuccess, customers, customerSuccessAway) {
  const n = customerSuccess.length;
  const m = customers.length;
  const t = customerSuccessAway.length;

  const csScores = customerSuccess.map((cs) => cs.score);
  const csIds = customerSuccess.map((cs) => cs.id);

  const customersIds = customers.map((c) => c.id);
  const customersScores = customers.map((c) => c.score);

  const inputValidations = [
    {
      name: ValidationErrors.CS_LENGTH,
      value: n,
      max: maxCsLength,
    },
    {
      name: ValidationErrors.CUSTOMER_LENGTH,
      value: m,
      max: maxCustomersLength,
    },
    {
      name: ValidationErrors.CS_AWAY,
      value: t,
      max: getMaxCsAway(customerSuccess),
    },
    {
      name: ValidationErrors.CS_ALLOWED_IDS,
      value: csIds,
      max: maxCsId,
    },
    {
      name: ValidationErrors.CS_ALLOWED_SCORES,
      value: csScores,
      max: maxCsScore,
    },
    {
      name: ValidationErrors.CUSTOMER_ALLOWED_ID,
      value: customersIds,
      max: maxCustomerId,
    },
    {
      name: ValidationErrors.CUSTOMER_ALLOWED_SCORE,
      value: customersScores,
      max: maxCustomerScore,
    },
  ];

  if (new Set(csScores).size !== csScores.length) {
    throw new Error(
      `Invalid ${ValidationErrors.CS_DIFFERENT_SCORES}. All CSs should have different levels.`
    );
  }

  for (const { name, value, max } of inputValidations) {
    if (name === ValidationErrors.CS_AWAY) {
      if (t > getMaxCsAway(customerSuccess)) {
        throw new Error(
          `Invalid ${
            ValidationErrors.CS_AWAY
          }: ${t}. The number of CSs away must be less than ${getMaxCsAway(
            customerSuccess
          )}.`
        );
      }
    } else if (Array.isArray(value)) {
      const hasInvalidValues = value.some((v) => v <= 0 || v >= max);
      if (hasInvalidValues) {
        throw new Error(
          `Invalid ${name}: ${value}. The ${name} must be greater than 0 and less than ${max}.`
        );
      }
    } else if (value <= 0 || value >= max) {
      throw new Error(
        `Invalid ${name}: ${value}. The ${name} must be greater than 0 and less than ${max}.`
      );
    }
  }

  return true;
}

test("Scenario 2", () => {
  const css = mapEntities([11, 21, 31, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 3", () => {
  const testTimeoutInMs = 100;
  const testStartTime = new Date().getTime();

  const css = mapEntities(arraySeq(999, 1));
  const customers = buildSizeEntities(10000, 998);
  const csAway = [999];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(998);

  if (new Date().getTime() - testStartTime > testTimeoutInMs) {
    throw new Error(`Test took longer than ${testTimeoutInMs}ms!`);
  }
});

test("Scenario 4", () => {
  const css = mapEntities([1, 2, 3, 4, 5, 6]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 5", () => {
  const css = mapEntities([100, 2, 3, 6, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

test("Scenario 6", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [1, 3, 2];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 7", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [4, 5, 6];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(3);
});

describe("Scenario 8 - validateInputs", () => {
  it("throws an error if all CSs do not have different scores", () => {
    const customerSuccess = [
      { id: 1, score: 100 },
      { id: 2, score: 100 },
    ];
    const customers = [];
    const customerSuccessAway = [];
    expect(() =>
      validateInputs(customerSuccess, customers, customerSuccessAway)
    ).toThrowError(new RegExp(ValidationErrors.CS_DIFFERENT_SCORES));
  });

  it(`throws an error if the number of CSs is equal or greater than ${maxCsLength}`, () => {
    const customerSuccess = mapEntities(arraySeq(maxCsLength, 1));
    const customers = [];
    const customerSuccessAway = [];
    expect(() =>
      validateInputs(customerSuccess, customers, customerSuccessAway)
    ).toThrowError(new RegExp(ValidationErrors.CS_LENGTH));
  });

  it(`throws an error if the number of customers is equal or greater than ${maxCustomersLength}`, () => {
    const customerSuccess = mapEntities(arraySeq(2, 1));
    const customers = Array(maxCustomersLength).fill(0);
    const customerSuccessAway = [];
    expect(() =>
      validateInputs(customerSuccess, customers, customerSuccessAway)
    ).toThrowError(new RegExp(ValidationErrors.CUSTOMER_LENGTH));
  });

  const customerSuccess = mapEntities(arraySeq(3, 1));
  it(`throws an error if the number of CSs away is equal or greater than ${getMaxCsAway(
    customerSuccess
  )}`, () => {
    const customers = mapEntities([3, 4, 5]);
    const customerSuccessAway = [1, 2, 3];

    expect(() =>
      validateInputs(customerSuccess, customers, customerSuccessAway)
    ).toThrowError(new RegExp(ValidationErrors.CS_AWAY));
  });

  it(`throws an error if the Cs ID is equal or greater than ${maxCsId}`, () => {
    const customerSuccess = [
      { id: maxCsId - 1, score: 10 },
      { id: maxCsId, score: 20 },
    ];
    const customers = mapEntities([3, 4, 5]);
    const customerSuccessAway = [];

    expect(() =>
      validateInputs(customerSuccess, customers, customerSuccessAway)
    ).toThrowError(new RegExp(ValidationErrors.CS_ALLOWED_IDS));
  });

  it(`throws an error if the Cs score is equal or greater than ${maxCsScore}`, () => {
    const customerSuccess = [
      { id: 1, score: maxCsScore - 1 },
      { id: 2, score: maxCsScore },
    ];
    const customers = mapEntities([3, 4, 5]);
    const customerSuccessAway = [];

    expect(() =>
      validateInputs(customerSuccess, customers, customerSuccessAway)
    ).toThrowError(new RegExp(ValidationErrors.CS_ALLOWED_SCORES));
  });

  it(`throws an error if the customer ID is equal or greater than ${maxCustomerId}`, () => {
    const customerSuccess = mapEntities(arraySeq(2, 1));
    const customers = [
      { id: maxCustomerId - 1, score: 10 },
      { id: maxCustomerId, score: 20 },
    ];
    const customerSuccessAway = [];

    expect(() =>
      validateInputs(customerSuccess, customers, customerSuccessAway)
    ).toThrowError(new RegExp(ValidationErrors.CUSTOMER_ALLOWED_IDS));
  });

  it(`throws an error if the customer score is equal or greater than ${maxCustomerScore}`, () => {
    const customerSuccess = mapEntities(arraySeq(2, 1));
    const customers = [
      { id: 1, score: maxCustomerScore - 1 },
      { id: 2, score: maxCustomerScore },
    ];
    const customerSuccessAway = [];

    expect(() =>
      validateInputs(customerSuccess, customers, customerSuccessAway)
    ).toThrowError(new RegExp(ValidationErrors.CUSTOMER_ALLOWED_SCORES));
  });
});