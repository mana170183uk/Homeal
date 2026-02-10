export function newChefNotificationHtml(params: {
  chefName: string;
  kitchenName: string;
  chefEmail: string;
  approveUrl: string;
  rejectUrl: string;
  superAdminPanelUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background:#FFF0F3;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #FFD6E0;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;">
        <span style="color:#2D8B3D;">Ho</span><span style="color:#FF8534;">me</span><span style="color:#2D8B3D;">al</span>
      </h1>
      <p style="color:#9595B0;font-size:13px;margin:4px 0 0;">New Chef Registration</p>
    </div>
    <p style="color:#2D2D3F;font-size:15px;">A new chef has registered and is waiting for your approval:</p>
    <div style="background:#F5F0FF;border-radius:12px;padding:16px;margin:16px 0;">
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="color:#9595B0;padding:6px 0;width:80px;">Name</td><td style="font-weight:600;color:#2D2D3F;">${params.chefName}</td></tr>
        <tr><td style="color:#9595B0;padding:6px 0;">Kitchen</td><td style="font-weight:600;color:#2D2D3F;">${params.kitchenName}</td></tr>
        <tr><td style="color:#9595B0;padding:6px 0;">Email</td><td style="color:#2D2D3F;">${params.chefEmail}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${params.approveUrl}" style="display:inline-block;background:#10B981;color:#fff;padding:12px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-right:12px;">Approve</a>
      <a href="${params.rejectUrl}" style="display:inline-block;background:#EF4444;color:#fff;padding:12px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Reject</a>
    </div>
    <p style="font-size:12px;color:#9595B0;text-align:center;margin-top:24px;">
      Or manage from the <a href="${params.superAdminPanelUrl}" style="color:#8B5CF6;font-weight:600;">Super Admin Panel</a>
    </p>
    <hr style="border:none;border-top:1px solid #FFD6E0;margin:24px 0 16px;">
    <p style="font-size:11px;color:#AEAEC8;text-align:center;">Homeal - Healthy food, from home.</p>
  </div>
</body></html>`;
}

export function chefApprovedHtml(params: {
  chefName: string;
  kitchenName: string;
  trialEndsAt: string;
  dashboardUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background:#FFF0F3;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #FFD6E0;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;">
        <span style="color:#2D8B3D;">Ho</span><span style="color:#FF8534;">me</span><span style="color:#2D8B3D;">al</span>
      </h1>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#ECFDF5;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">&#10003;</div>
    </div>
    <h2 style="text-align:center;color:#2D2D3F;font-size:20px;margin:0 0 8px;">Welcome to Homeal, ${params.chefName}!</h2>
    <p style="text-align:center;color:#4A4A65;font-size:14px;line-height:1.6;">
      Great news! Your kitchen <strong>${params.kitchenName}</strong> has been approved. You can now start listing your delicious home-cooked meals.
    </p>
    <div style="background:linear-gradient(135deg,#F5F0FF,#FFF0F3);border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
      <p style="margin:0 0 4px;color:#8B5CF6;font-weight:700;font-size:16px;">Unlimited Plan - Free Trial</p>
      <p style="margin:0;color:#4A4A65;font-size:13px;">Your free trial is active until <strong>${params.trialEndsAt}</strong></p>
      <p style="margin:8px 0 0;color:#9595B0;font-size:12px;">Includes unlimited orders, all product categories, premium features</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${params.dashboardUrl}" style="display:inline-block;background:#8B5CF6;color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Open Your Dashboard</a>
    </div>
    <h3 style="color:#2D2D3F;font-size:15px;margin:24px 0 12px;">What&rsquo;s next?</h3>
    <ul style="color:#4A4A65;font-size:13px;line-height:2;padding-left:20px;">
      <li>Set up your kitchen profile and operating hours</li>
      <li>Add your menu items and homemade products</li>
      <li>Configure delivery and pickup options</li>
      <li>Start accepting orders from nearby customers</li>
    </ul>
    <hr style="border:none;border-top:1px solid #FFD6E0;margin:24px 0 16px;">
    <p style="font-size:11px;color:#AEAEC8;text-align:center;">
      Need help? Email us at <a href="mailto:homealforuk@gmail.com" style="color:#8B5CF6;">homealforuk@gmail.com</a><br>
      Homeal - Healthy food, from home.
    </p>
  </div>
</body></html>`;
}

export function adminAccessRequestHtml(params: {
  requesterName: string;
  requesterEmail: string;
  approveUrl: string;
  rejectUrl: string;
  superAdminPanelUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background:#FFF0F3;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #FFD6E0;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;">
        <span style="color:#2D8B3D;">Ho</span><span style="color:#FF8534;">me</span><span style="color:#2D8B3D;">al</span>
      </h1>
      <p style="color:#9595B0;font-size:13px;margin:4px 0 0;">Super Admin Access Request</p>
    </div>
    <p style="color:#2D2D3F;font-size:15px;">Someone has requested Super Admin access to the Homeal platform:</p>
    <div style="background:#F5F0FF;border-radius:12px;padding:16px;margin:16px 0;">
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="color:#9595B0;padding:6px 0;width:80px;">Name</td><td style="font-weight:600;color:#2D2D3F;">${params.requesterName}</td></tr>
        <tr><td style="color:#9595B0;padding:6px 0;">Email</td><td style="color:#2D2D3F;">${params.requesterEmail}</td></tr>
      </table>
    </div>
    <p style="color:#4A4A65;font-size:13px;line-height:1.6;">If you recognise this person and want to grant them Super Admin access, click Approve. Otherwise, click Reject.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${params.approveUrl}" style="display:inline-block;background:#10B981;color:#fff;padding:12px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-right:12px;">Approve</a>
      <a href="${params.rejectUrl}" style="display:inline-block;background:#EF4444;color:#fff;padding:12px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Reject</a>
    </div>
    <p style="font-size:12px;color:#9595B0;text-align:center;margin-top:24px;">
      Or manage from the <a href="${params.superAdminPanelUrl}" style="color:#8B5CF6;font-weight:600;">Super Admin Panel</a>
    </p>
    <hr style="border:none;border-top:1px solid #FFD6E0;margin:24px 0 16px;">
    <p style="font-size:11px;color:#AEAEC8;text-align:center;">Homeal - Healthy food, from home.</p>
  </div>
</body></html>`;
}

export function adminAccessApprovedHtml(params: {
  name: string;
  loginUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background:#FFF0F3;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #FFD6E0;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;">
        <span style="color:#2D8B3D;">Ho</span><span style="color:#FF8534;">me</span><span style="color:#2D8B3D;">al</span>
      </h1>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#ECFDF5;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">&#10003;</div>
    </div>
    <h2 style="text-align:center;color:#2D2D3F;font-size:20px;margin:0 0 8px;">Access Granted!</h2>
    <p style="text-align:center;color:#4A4A65;font-size:14px;line-height:1.6;">
      Hi ${params.name}, your Super Admin access request has been approved. You can now log in to the Super Admin portal.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${params.loginUrl}" style="display:inline-block;background:#8B5CF6;color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Log In Now</a>
    </div>
    <hr style="border:none;border-top:1px solid #FFD6E0;margin:24px 0 16px;">
    <p style="font-size:11px;color:#AEAEC8;text-align:center;">Homeal - Healthy food, from home.</p>
  </div>
</body></html>`;
}

export function adminAccessRejectedHtml(params: {
  name: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background:#FFF0F3;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #FFD6E0;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;">
        <span style="color:#2D8B3D;">Ho</span><span style="color:#FF8534;">me</span><span style="color:#2D8B3D;">al</span>
      </h1>
    </div>
    <h2 style="text-align:center;color:#2D2D3F;font-size:20px;margin:0 0 8px;">Access Request Update</h2>
    <p style="text-align:center;color:#4A4A65;font-size:14px;line-height:1.6;">
      Hi ${params.name}, your Super Admin access request has been reviewed. Unfortunately, it was not approved at this time.
    </p>
    <p style="text-align:center;color:#4A4A65;font-size:14px;line-height:1.6;">
      If you believe this was a mistake, please contact the platform owner.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="mailto:homealforuk@gmail.com" style="display:inline-block;background:#8B5CF6;color:#fff;padding:12px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Contact Support</a>
    </div>
    <hr style="border:none;border-top:1px solid #FFD6E0;margin:24px 0 16px;">
    <p style="font-size:11px;color:#AEAEC8;text-align:center;">Homeal - Healthy food, from home.</p>
  </div>
</body></html>`;
}

export function chefRejectedHtml(params: {
  chefName: string;
  reason?: string;
}): string {
  const reasonBlock = params.reason
    ? `<div style="background:#FFF5F5;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #EF4444;">
        <p style="margin:0;color:#4A4A65;font-size:13px;"><strong>Reason:</strong> ${params.reason}</p>
      </div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background:#FFF0F3;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #FFD6E0;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;">
        <span style="color:#2D8B3D;">Ho</span><span style="color:#FF8534;">me</span><span style="color:#2D8B3D;">al</span>
      </h1>
    </div>
    <h2 style="text-align:center;color:#2D2D3F;font-size:20px;margin:0 0 8px;">Registration Update</h2>
    <p style="text-align:center;color:#4A4A65;font-size:14px;line-height:1.6;">
      Hi ${params.chefName}, thank you for your interest in joining Homeal. Unfortunately, we are unable to approve your registration at this time.
    </p>
    ${reasonBlock}
    <p style="text-align:center;color:#4A4A65;font-size:14px;line-height:1.6;">
      If you believe this was a mistake or would like to provide additional information, please don&rsquo;t hesitate to reach out.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="mailto:homealforuk@gmail.com" style="display:inline-block;background:#8B5CF6;color:#fff;padding:12px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Contact Support</a>
    </div>
    <hr style="border:none;border-top:1px solid #FFD6E0;margin:24px 0 16px;">
    <p style="font-size:11px;color:#AEAEC8;text-align:center;">Homeal - Healthy food, from home.</p>
  </div>
</body></html>`;
}
