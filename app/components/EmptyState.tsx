export default function EmptyState() {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 flex items-start justify-center py-10">
      <div className="text-center max-w-2xl w-full px-8">
        <p className="text-5xl mb-6">👋</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Welcome to the Thrive Creative Development Onsite Interview
        </h2>
        <p className="text-gray-500 leading-relaxed">
          Your job is to plumb in the application data for this UI and create a working application.
          You will be graded on your ability to drive an application end to end storing Customers,
          Notes for those customers, and also ticket status for those customers.
        </p>
        <div className="mt-6 text-left bg-white border border-gray-200 rounded-xl p-4 text-sm space-y-4">
          <div>
            <p className="font-semibold text-gray-700 mb-2">Database</p>
            <p className="text-gray-500 mb-3">
              A <code className="bg-gray-100 px-1 rounded text-gray-600">docker-compose.yml</code> is
              included. Run this to provision MySQL:
            </p>
            <pre className="bg-gray-900 text-green-400 rounded-lg px-4 py-3 text-xs font-mono whitespace-pre">docker compose up -d</pre>
            <p className="text-gray-400 text-xs mt-2">
              DB: <span className="text-gray-600 font-medium">test</span> &nbsp;·&nbsp;
              User: <span className="text-gray-600 font-medium">test</span> &nbsp;·&nbsp;
              Password: <span className="text-gray-600 font-medium">test</span> &nbsp;·&nbsp;
              Port: <span className="text-gray-600 font-medium">3306</span>
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="font-semibold text-gray-700 mb-2">Data folder</p>
            <p className="text-gray-500 mb-3">
              The <code className="bg-gray-100 px-1 rounded text-gray-600">data/</code> folder contains
              the records we expect you to serve. Each customer has its own subfolder — the folder name
              is the customer ID and communicates the relationship in place of a foreign key:
            </p>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs font-mono text-gray-600 whitespace-pre">
{`data/
├── customers.json
├── ticket_status.json
├── cust_001/
│   ├── notes.json
│   └── tickets.json
├── cust_002/
│   ├── notes.json
│   └── tickets.json
└── cust_003/
    ├── notes.json
    └── tickets.json`}
            </pre>
            <p className="text-gray-400 text-xs mt-2">
              See <code className="text-gray-500">data/README.md</code> for the full breakdown.
            </p>
          </div>
        </div>

        {/* Grading rubric */}
        <div className="mt-6 text-left bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
          <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
            <p className="font-semibold text-white">Grading Rubric</p>
            <p className="text-gray-400 text-xs">140 points total</p>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-start gap-4 px-4 py-3">
              <span className="flex-shrink-0 w-8 text-right font-bold text-indigo-600">25</span>
              <div>
                <p className="font-medium text-gray-800">API routes return correct data</p>
                <p className="text-gray-500 text-xs mt-0.5">All routes exist and the UI displays data that matches the records in the <code className="bg-gray-100 px-1 rounded">data/</code> folder exactly.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-3">
              <span className="flex-shrink-0 w-8 text-right font-bold text-indigo-600">15</span>
              <div>
                <p className="font-medium text-gray-800">Phone number search works</p>
                <p className="text-gray-500 text-xs mt-0.5">The customer list filters in real time as you type a phone number into the search field.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-3">
              <span className="flex-shrink-0 w-8 text-right font-bold text-indigo-600">20</span>
              <div>
                <p className="font-medium text-gray-800">Database schema created and mapped</p>
                <p className="text-gray-500 text-xs mt-0.5">A working schema is created from the data folder structure. The application reads from and writes to the database, not the flat files.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-3">
              <span className="flex-shrink-0 w-8 text-right font-bold text-indigo-600">15</span>
              <div>
                <p className="font-medium text-gray-800">REST-compliant URL structure</p>
                <p className="text-gray-500 text-xs mt-0.5">API routes follow REST conventions — correct HTTP verbs, resource-based paths, and appropriate status codes.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-3">
              <span className="flex-shrink-0 w-8 text-right font-bold text-indigo-600">10</span>
              <div>
                <p className="font-medium text-gray-800">Thrive logo placed in the UI</p>
                <p className="text-gray-500 text-xs mt-0.5">Find the Thrive Creative logo and integrate it appropriately into the application.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-3">
              <span className="flex-shrink-0 w-8 text-right font-bold text-indigo-600">10</span>
              <div>
                <p className="font-medium text-gray-800">Customer list pagination — up to 500 customers</p>
                <p className="text-gray-500 text-xs mt-0.5">The sidebar must handle a large customer list gracefully. The shell data must remain in place and pagination should work alongside it — do not remove the placeholder records.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-3">
              <span className="flex-shrink-0 w-8 text-right font-bold text-indigo-600">15</span>
              <div>
                <p className="font-medium text-gray-800">CRUD — creation of records</p>
                <p className="text-gray-500 text-xs mt-0.5">Creating new customers, notes, and tickets must work end to end — form submission persists the record and the UI updates to reflect it without a full page reload.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-3">
              <span className="flex-shrink-0 w-8 text-right font-bold text-indigo-600">15</span>
              <div>
                <p className="font-medium text-gray-800">CRUD — editing of records</p>
                <p className="text-gray-500 text-xs mt-0.5">Existing customers, notes, and tickets can be edited. Changes persist to the database and the UI reflects the updated values immediately.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-3 bg-amber-50">
              <span className="flex-shrink-0 w-8 text-right font-bold text-amber-600">15</span>
              <div>
                <p className="font-medium text-gray-800">Attention to detail</p>
                <p className="text-gray-500 text-xs mt-0.5">There are at least 10 details in a quality solution that separate a good submission from a great one. We are not going to list them — but they matter, and we will be looking for them.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
