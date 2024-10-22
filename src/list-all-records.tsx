import { useEffect, useState } from "react";
import { List, ActionPanel, Action, getPreferenceValues, Icon, Color } from "@raycast/api";
import axios from "axios";

interface Opportunity {
  id: string;
  name: string;
  closeDate: string;
  amount: {
    amountMicros: number;
    currencyCode: string;
  };
  stage: string;
}

interface Person {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  email: {
    primaryEmail: string;
  };
  linkedinLink: {
    primaryLinkUrl: string;
  };
  xLink: {
    primaryLinkUrl: string;
  };
  jobTitle: string;
  city: string;
  avatarUrl: string;
  position: number;
  createdBy: {
    source: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  employees: number;
  annualRecurringRevenue: {
    amountMicros: number;
    currencyCode: string;
  };
  domainName: {
    primaryLinkUrl: string;
  };
  linkedinLink: {
    primaryLinkUrl: string;
  };
  xLink: {
    primaryLinkUrl: string;
  };
  address: {
    addressStreet1: string;
    addressCity: string;
    addressCountry: string;
  };
  position: number;
  createdBy: {
    source: string;
    name: string;
  };
  people: Person[];
  opportunities: Opportunity[];
}

interface ApiResponse {
  data: {
    companies: Company[];
    pageInfo: {
      hasNextPage: boolean;
      startCursor: string;
      endCursor: string;
      totalCount: number;
    };
  };
}

export default function Command() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      const preferences = getPreferenceValues();
      const twentyApiKey = preferences.twentyApiKey;
      const response = await axios.get<ApiResponse>("https://api-demo.twenty.com/rest/companies", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${twentyApiKey}`,
        },
      });
      setCompanies(response.data.data.companies);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setIsLoading(false);
    }
  }
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchText.toLowerCase())
  );
  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search companies"
      throttle
    >
      {error ? (
        <List.EmptyView title="No Companies Found" description={error} icon={Icon.Warning} />
      ) : (
        filteredCompanies.map((company) => (
          <List.Item
            key={company.id}
            title={company.name}
            subtitle={`${company.address.addressCity}, ${company.address.addressCountry}`}
            accessories={[
              { text: `${company.employees} Employees` },
              {
                text: {
                  value: `${(company.annualRecurringRevenue.amountMicros / 1e6).toFixed(2)} ${company.annualRecurringRevenue.currencyCode}`,
                  color: Color.Green,
                },
              },
            ]}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="View Company" url={company.domainName.primaryLinkUrl} />
                <Action.OpenInBrowser title="View on LinkedIn" url={company.linkedinLink.primaryLinkUrl} />
                {company.people.length > 0 && (
                  <Action.Push title="View People" target={<PeopleList people={company.people} />} />
                )}
                {company.opportunities.length > 0 && (
                  <Action.Push title="View Opportunities" target={<OpportunitiesList opportunities={company.opportunities} />} />
                )}
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

function PeopleList({ people }: { people: Person[] }) {
  return (
    <List searchBarPlaceholder="Search people">
      {people.map((person) => (
        <List.Item
          key={person.id}
          title={`${person.name.firstName} ${person.name.lastName}`}
          subtitle={person.jobTitle}
          accessories={[
            { icon: Icon.Person, text: person.city },
            { text: `Joined: ${new Date(person.createdAt).toLocaleDateString()}` },
          ]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="View LinkedIn" url={person.linkedinLink.primaryLinkUrl} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function OpportunitiesList({ opportunities }: { opportunities: Opportunity[] }) {
  return (
    <List searchBarPlaceholder="Search opportunities">
      {opportunities.map((opportunity) => (
        <List.Item
          key={opportunity.id}
          title={opportunity.name}
          subtitle={opportunity.stage}
          accessories={[
            {
              text: `Amount: ${(opportunity.amount.amountMicros / 1e6).toFixed(2)} ${opportunity.amount.currencyCode}`,
            },
            { text: `Close Date: ${new Date(opportunity.closeDate).toLocaleDateString()}` },
          ]}
        />
      ))}
    </List>
  );
}
