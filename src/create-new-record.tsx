import { Form, ActionPanel, Action, showToast, getPreferenceValues, Toast } from "@raycast/api";
import axios from "axios";
type Values = {
  name: string;
  domainName: string;
  employees: number;
  linkedinLink: string;
  xLink: string;
  addressStreet1: string;
  addressCity: string;
  annualRecurringRevenue: string;
  currencyCode: string;
  addressCountry: string;
  idealCustomerProfile: boolean;
};

export default function Command() {
  const preferences = getPreferenceValues();
  const twentyApiKey = preferences.twentyApiKey;
  async function handleSubmit(values: Values) {
    const payload = {
      name: values.name,
      position: 0,
      domainName: {
        primaryLinkUrl: values.domainName,
      },
      employees: parseInt(values.employees.toString(), 10) || 0,
      linkedinLink: {
        primaryLinkUrl: values.linkedinLink,
      },
      xLink: {
        primaryLinkUrl: values.xLink,
      },
      annualRecurringRevenue: {
        amountMicros: parseInt(values.annualRecurringRevenue, 10) || 0,
        currencyCode: values.currencyCode,
      },
      address: {
        addressStreet1: values.addressStreet1,
        addressCity: values.addressCity,
        addressCountry: values.addressCountry,
      },
      createdBy: {
        source: "API",
      },
    };

    try {
      const response = await axios.post("https://api-demo.twenty.com/rest/companies", payload, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${twentyApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      console.log("API Response:", data);
      showToast({ title: "Success", message: "Company created successfully" });
    } catch (error) {
      console.error("Error:", error);
      showToast({ title: "Error", message: "Failed to create company", style: Toast.Style.Failure });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Create Company" />
        </ActionPanel>
      }
    >
      <Form.Description text="Create a new company in Twenty CRM. Only the company name is required; additional details are optional." />
      {/* Required Field */}
      <Form.TextField id="name" title="Company Name" placeholder="Enter company name" autoFocus />

      {/* Optional Fields */}
      <Form.Separator />

      <Form.TextField
        id="domainName"
        title="Website URL"
        placeholder="https://www.example.com"
        info="Company's website URL."
      />

      <Form.TextField
        id="employees"
        title="Number of Employees"
        placeholder="Enter number of employees"
        info="Total number of employees in the company."
      />

      <Form.TextField
        id="linkedinLink"
        title="LinkedIn URL"
        placeholder="https://www.linkedin.com/company/example"
        info="Company's LinkedIn profile URL."
      />

      <Form.TextField
        id="xLink"
        title="Twitter/X URL"
        placeholder="https://twitter.com/example"
        info="Company's Twitter/X profile URL."
      />
      <Form.TextField
        id="annualRecurringRevenue"
        title="Annual Recurring Revenue"
        placeholder="Annual recurring revenue (Micros)"
      />
      <Form.TextField id="currencyCode" title="Currency Code" placeholder="Currency code (e.g. USD)" />

      <Form.TextField
        id="addressStreet1"
        title="Address Line 1"
        placeholder="123 Main St"
        info="Primary address line."
      />

      <Form.TextField id="addressCity" title="City" placeholder="New York" info="City of the company's address." />

      <Form.TextField id="addressCountry" title="Country" placeholder="USA" info="Country of the company's address." />

      <Form.Checkbox
        id="idealCustomerProfile"
        title="Ideal Customer Profile"
        label="Is this an ideal customer profile?"
        info="Mark if the company is an ideal customer."
      />
    </Form>
  );
}
