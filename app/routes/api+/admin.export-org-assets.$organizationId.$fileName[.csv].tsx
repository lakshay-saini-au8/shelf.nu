import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuthSession } from "~/modules/auth";
import { requireOrganisationId } from "~/modules/organization/context.server";
import { assertUserCanExportAssets } from "~/modules/tier";
import { getRequiredParam } from "~/utils";
import { exportAssetsToCsv } from "~/utils/csv.server";
import { requireAdmin } from "~/utils/roles.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const authSession = await requireAuthSession(request);
  await requireAdmin(request);
  const organizationId = getRequiredParam(params, "organizationId");
  const { organizations } = await requireOrganisationId(authSession, request);

  await assertUserCanExportAssets({ organizationId, organizations });

  /** Join the rows with a new line */
  const csvString = await exportAssetsToCsv({ organizationId });

  return new Response(csvString, {
    status: 200,
    headers: {
      "content-type": "text/csv",
    },
  });
};
