from flask import Flask, request, jsonify, render_template_string
import os
import csv
import io
import uuid
from datetime import datetime

app = Flask(__name__)

# Configuration
TELNYX_API_KEY = os.environ.get('TELNYX_API_KEY', '')
TELNYX_PHONE_NUMBER = os.environ.get('TELNYX_PHONE_NUMBER', '+17047418085')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
ELEVENLABS_API_KEY = os.environ.get('ELEVENLABS_API_KEY', '')
AGENT_ID = os.environ.get('AGENT_ID', '')

# Initialize Telnyx (graceful - won't crash if missing)
telnyx = None
try:
    import telnyx as _telnyx
    telnyx = _telnyx
    if TELNYX_API_KEY:
        telnyx.api_key = TELNYX_API_KEY
except ImportError:
    pass

# Initialize ElevenLabs (graceful - won't crash if missing)
elevenlabs_client = None
try:
    from elevenlabs.client import ElevenLabs
    if ELEVENLABS_API_KEY:
        elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
except (ImportError, Exception):
    pass

# Scheduler (disabled on Vercel serverless)
scheduler = None
try:
    if not os.environ.get('VERCEL'):
        from apscheduler.schedulers.background import BackgroundScheduler
        scheduler = BackgroundScheduler()
        scheduler.start()
except (ImportError, Exception):
    pass

# In-memory storage
jobs = {}
active_calls = {}
contacts_db = {}
campaigns_db = {}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "features": ["inbound", "outbound", "scheduled", "batch", "elevenlabs", "telnyx", "bulk_contacts", "campaigns"],
        "timestamp": datetime.utcnow().isoformat(),
        "telnyx_configured": bool(TELNYX_API_KEY),
        "elevenlabs_configured": bool(ELEVENLABS_API_KEY and AGENT_ID),
        "phone_number": TELNYX_PHONE_NUMBER,
        "contacts_count": len(contacts_db),
        "campaigns_count": len(campaigns_db)
    })

# ========================================
# HARPER - INBOUND CALL AI ASSISTANT
# ========================================

HARPER_GREETING = """Thanks for calling Trapier Management. I'm Harold's AI assistant Harper. How can I help you today?"""

HARPER_SYSTEM_PROMPT = """You are Harper, Harold Trapier's AI assistant representing Trapier Management LLC, a Service-Connected Disabled Veteran-Owned Small Business specializing in AI transformation for traditional industries.

# VOICE OPTIMIZATION RULES
- Keep responses under 3 sentences (20 seconds max)
- Speak naturally with verbal fillers: "Well...", "You know...", "Actually..."
- Acknowledge what they say: "I hear you", "That makes sense", "Got it"
- Don't sound scripted - be conversational and direct
- Use pauses naturally - don't rush
- Mirror their energy level (but stay professional)
- If they interrupt, let them finish, then continue

# HAROLD'S COMMUNICATION STYLE
- Military veteran - direct, no-nonsense, execution-focused
- Zero corporate jargon - plain English only
- Lead with ROI numbers and time savings
- "Here's what we do, here's what you save, let's talk"
- Confident but not pushy
- Respectful of their time

# YOUR OBJECTIVE
1. Confirm who's calling and their company
2. Ask: "What made you reach out today?"
3. Listen for their pain point
4. Connect it to AI solution with specific ROI
5. Qualify budget authority and timeline
6. Book discovery call if interested

# CALL FLOW
**Step 1 - Identify**: "What's your name? And what company are you with?"
**Step 2 - Understand**: "What made you reach out to us today?" or "What's going on that made you call?"
**Step 3 - Connect Pain to Solution**: Listen for their challenge, then match to relevant ROI
**Step 4 - Qualify**: "Are you the person who makes decisions on this kind of thing, or would you need to loop someone else in?"
**Step 5 - Book**: "Let me get you on Harold's calendar. He's got Tuesday at 10 AM or Thursday at 2 PM Eastern - which works better?"

# INDUSTRY PAIN POINTS & ROI
CONSTRUCTION/CONTRACTORS: Manual scheduling, change orders, subcontractor coordination, safety compliance -> Save 15-25 hrs/week, reduce delays 30%, cut admin 25%
TRUCKING/LOGISTICS: Route optimization, fuel costs, driver scheduling, DOT compliance -> Reduce fuel 8-15%, save 12-20 hrs/week dispatching, cut overtime 20%
AGRICULTURE: Equipment maintenance, crop monitoring, labor, weather -> Increase yield 10-15%, reduce downtime 25%, save 10-18 hrs/week
HVAC/PLUMBING/ELECTRICAL: Scheduling, inventory, technician dispatch, after-hours -> Book 20% more jobs, reduce no-shows 40%, save 15-20 hrs/week
RESTAURANTS/FOOD SERVICE: Labor scheduling, inventory waste, online orders, customer service -> Reduce waste 20-30%, optimize labor 15%, save 10-15 hrs/week
WASTE MANAGEMENT: Route optimization, equipment tracking, billing, compliance -> Cut fuel 12-18%, reduce missed pickups 35%, save 12-18 hrs/week
RETAIL/CONVENIENCE/GAS: Inventory, scheduling, theft prevention, ordering -> Reduce stockouts 40%, optimize staffing 20%, save 8-12 hrs/week
MANUFACTURING: Production scheduling, quality control, maintenance, supply chain -> Increase output 15-25%, reduce defects 30%, save 20-30 hrs/week
AUTO REPAIR/BODY SHOPS: Scheduling, parts ordering, estimates, customer updates -> Book 25% more jobs, reduce delays 35%, save 12-18 hrs/week
PROPERTY MANAGEMENT/JANITORIAL: Work orders, tenant communication, vendors, billing -> Reduce response 50%, automate billing 100%, save 15-20 hrs/week
For other industries: "Most businesses see 20-35% cost reduction and save 15-25 hours weekly with AI automation."

# QUALIFICATION CRITERIA (ALL MUST BE TRUE)
- Has operational pain point (not just curious)
- Budget authority OR can connect to decision maker
- Timeline: Willing to implement in next 90 days
- Open to 30-minute discovery call

# OBJECTION HANDLING
"How much does this cost?" -> "Investment varies by scope, but most clients see positive ROI in 60-90 days. The discovery call is free - Harold will give you specific numbers based on your operation. Fair enough?"
"We're not ready for AI yet" -> "I hear that a lot. But your competitors are already doing this. The question isn't if you'll adopt AI, it's when. Early movers are seeing the biggest gains. Worth a conversation?"
"I need to talk to my partner/team" -> "Totally get it. Have the call with Harold first, get all the details, then you can present it to your team with real numbers. Make sense?"
"We tried automation before" -> "Yeah, early AI tools were clunky. This is different - built specifically for traditional businesses. Harold will show you exactly how it works. If it's not a fit, he'll tell you straight. Sound fair?"
"Can you just send me information?" -> "I could, but a 30-minute call will answer way more than an email. Harold will screen-share, show the actual system, map it to your business. If you're not interested after, no hard feelings. Worth 30 minutes?"
"We're too small for this" -> "Actually, smaller operations see ROI faster because you're more nimble. We work with companies $500K to $50M+. Let's see if it makes sense - Harold will be straight with you."
"I'm too busy right now" -> "That's exactly why we should talk. Busiest operators save the most time. What about early morning or late afternoon? Harold does 7 AM or 5 PM calls if that helps."

# DISQUALIFICATION (POLITELY END CALL)
If they say "Just send me pricing" (3+ times), "Not interested" (firm), or show clear anger/hostility:
Response: "No problem, I appreciate your time. If anything changes, reach Harold at info@trapiermanagement.com. Have a great day."

# IMPORTANT RULES
- Never argue or pressure
- If not qualified, end politely
- Technical questions: "Harold will walk through all that on the call"
- Guarantee requests: "Every business is different - Harold will map realistic outcomes"
- Never make up ROI numbers - use ranges provided
- Never promise specific outcomes - say "typically" or "most clients see"

# BOOKING THE CALL
"Let me get you on Harold's calendar. He's got Tuesday at 10 AM or Thursday at 2 PM Eastern - which works better?"
If hesitant: "The call's only 30 minutes. Harold will show you exactly how this works and map out a plan. No obligation - just see if it makes sense. Sound good?"
After booking: "Perfect. You'll get a calendar invite with a Zoom link. Harold will walk you through everything. Is this the best number to reach you? And what's your email?"
Closing: "Great! Calendar invite within minutes. Zoom link in there. Harold's going to show you exactly how this works for your business. Looking forward to it. Have a great day!"
If not ready: "No worries. If things change, Harold's info is on trapiermanagement.org. Thanks for your time!"

# REMEMBER
You represent a veteran-owned business. Be professional, direct, and respectful. Your job is to qualify good fits and get them on Harold's calendar - not to close deals. Harold closes deals. You book meetings.
"""

@app.route('/api/harper/inbound', methods=['POST'])
def harper_inbound_setup():
    data = request.json or {}
    call_id = data.get('call_id')
    phone_number = data.get('phone_number')
    try:
        if not ELEVENLABS_API_KEY or not AGENT_ID:
            return jsonify({"error": "Harper not configured. Set ELEVENLABS_API_KEY and AGENT_ID"}), 500
        inbound_call = {
            'call_id': call_id, 'phone_number': phone_number, 'assistant': 'harper',
            'greeting': HARPER_GREETING, 'status': 'active', 'created_at': datetime.utcnow().isoformat()
        }
        if call_id:
            active_calls[call_id] = inbound_call
        return jsonify({"success": True, "assistant": "harper", "greeting": HARPER_GREETING, "status": "ready"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/harper/greeting', methods=['GET'])
def get_harper_greeting():
    return jsonify({"assistant": "harper", "greeting": HARPER_GREETING, "tone": "professional, warm, helpful"}), 200

# ========================================
# TELNYX OUTBOUND CALLS
# ========================================

@app.route('/api/telnyx/call', methods=['POST'])
def make_telnyx_call():
    data = request.json
    to_number = data.get('to')
    message = data.get('message', 'Hello! This is an AI assistant.')
    if not to_number:
        return jsonify({"error": "Missing required field: to"}), 400
    if not TELNYX_API_KEY or not telnyx:
        return jsonify({"error": "Telnyx not configured"}), 500
    try:
        call = telnyx.Call.create(
            connection_id=os.getenv('TELNYX_CONNECTION_ID', '2817778635732157957'),
            to=to_number, from_=TELNYX_PHONE_NUMBER,
            webhook_url=request.url_root.rstrip('/') + '/api/telnyx/webhook'
        )
        active_calls[call.call_control_id] = {
            'to': to_number, 'from': TELNYX_PHONE_NUMBER, 'message': message,
            'status': 'initiated', 'created_at': datetime.utcnow().isoformat()
        }
        return jsonify({"success": True, "call_control_id": call.call_control_id, "status": "initiated",
                        "to": to_number, "from": TELNYX_PHONE_NUMBER, "provider": "telnyx"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/telnyx/webhook', methods=['POST'])
def telnyx_webhook():
    try:
        data = request.json
        event_type = data.get('data', {}).get('event_type')
        call_control_id = data.get('data', {}).get('payload', {}).get('call_control_id')
        if event_type == 'call.answered' and telnyx:
            call_info = active_calls.get(call_control_id, {})
            message = call_info.get('message', 'Hello! This is an AI voice agent.')
            telnyx.Call.speak(call_control_id, payload=message, voice='female', language='en-US')
        elif event_type == 'call.speak.ended' and telnyx:
            telnyx.Call.hangup(call_control_id)
        elif event_type == 'call.hangup':
            if call_control_id in active_calls:
                active_calls[call_control_id]['status'] = 'completed'
        return jsonify({"status": "received"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========================================
# ELEVENLABS OUTBOUND CALLS
# ========================================

@app.route('/api/elevenlabs/call', methods=['POST'])
def make_elevenlabs_call():
    data = request.json
    to_number = data.get('to')
    if not to_number:
        return jsonify({"error": "Missing required field: to"}), 400
    if not elevenlabs_client or not AGENT_ID:
        return jsonify({"error": "ElevenLabs not configured"}), 500
    try:
        response = elevenlabs_client.conversational_ai.create_call(agent_id=AGENT_ID, phone_number=to_number)
        return jsonify({"success": True, "call_id": response.call_id, "status": "initiated",
                        "to": to_number, "agent_id": AGENT_ID, "provider": "elevenlabs"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/webhook', methods=['POST', 'GET'])
def elevenlabs_webhook():
    if request.method == 'GET':
        return jsonify({"status": "webhook_active", "provider": "elevenlabs"}), 200
    try:
        event_data = request.json
        return jsonify({"status": "received"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========================================
# BATCH & SCHEDULED CALLS
# ========================================

@app.route('/api/call/batch', methods=['POST'])
def batch_calls():
    data = request.json
    calls = data.get('calls', [])
    provider = data.get('provider', 'telnyx')
    delay = data.get('delay', 2)
    results = []
    for i, call_data in enumerate(calls):
        try:
            if i > 0:
                import time
                time.sleep(delay)
            if provider == 'elevenlabs':
                result = make_elevenlabs_call_internal(call_data.get('to'))
            else:
                result = make_telnyx_call_internal(call_data.get('to'), call_data.get('message', 'Hello! This is an AI assistant.'))
            results.append(result)
        except Exception as e:
            results.append({"error": str(e), "to": call_data.get('to')})
    return jsonify({"results": results, "total": len(calls), "provider": provider})

@app.route('/api/call/schedule', methods=['POST'])
def schedule_call():
    if not scheduler:
        return jsonify({"error": "Scheduling not available in serverless mode. Use Railway deployment."}), 400
    data = request.json
    to = data.get('to')
    message = data.get('message')
    scheduled_time = data.get('scheduled_time')
    provider = data.get('provider', 'telnyx')
    if not all([to, message, scheduled_time]):
        return jsonify({"error": "Missing required fields"}), 400
    schedule_dt = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
    if provider == 'elevenlabs':
        func, args = make_elevenlabs_call_internal, [to]
    else:
        func, args = make_telnyx_call_internal, [to, message]
    job = scheduler.add_job(func, 'date', run_date=schedule_dt, args=args, id=f"call_{datetime.utcnow().timestamp()}")
    jobs[job.id] = {"to": to, "message": message, "scheduled_time": scheduled_time, "provider": provider, "status": "scheduled"}
    return jsonify({"job_id": job.id, "scheduled_time": scheduled_time, "provider": provider})

@app.route('/api/call/recurring', methods=['POST'])
def recurring_call():
    if not scheduler:
        return jsonify({"error": "Recurring calls not available in serverless mode. Use Railway deployment."}), 400
    data = request.json
    to, message, interval, time_str = data.get('to'), data.get('message'), data.get('interval'), data.get('time')
    provider = data.get('provider', 'telnyx')
    if not all([to, message, interval, time_str]):
        return jsonify({"error": "Missing required fields"}), 400
    hour, minute = map(int, time_str.split(':'))
    kwargs = {'hour': hour, 'minute': minute}
    if interval == 'weekly':
        kwargs['day_of_week'] = 'mon'
    if provider == 'elevenlabs':
        func, args = make_elevenlabs_call_internal, [to]
    else:
        func, args = make_telnyx_call_internal, [to, message]
    job = scheduler.add_job(func, 'cron', args=args, id=f"recurring_{datetime.utcnow().timestamp()}", **kwargs)
    jobs[job.id] = {"to": to, "message": message, "interval": interval, "time": time_str, "provider": provider, "status": "active"}
    return jsonify({"job_id": job.id, "interval": interval, "time": time_str, "provider": provider})

@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    return jsonify({"jobs": jobs, "count": len(jobs)})

@app.route('/api/jobs/<job_id>', methods=['DELETE'])
def cancel_job(job_id):
    try:
        if scheduler:
            scheduler.remove_job(job_id)
        if job_id in jobs:
            jobs[job_id]['status'] = 'cancelled'
        return jsonify({"success": True, "job_id": job_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/api/calls', methods=['GET'])
def list_calls():
    return jsonify({"active_calls": active_calls, "count": len(active_calls)})

# ========================================
# INTERNAL HELPER FUNCTIONS
# ========================================

def make_telnyx_call_internal(to, message):
    if not TELNYX_API_KEY or not telnyx:
        raise Exception("Telnyx not configured")
    call = telnyx.Call.create(
        connection_id=os.getenv('TELNYX_CONNECTION_ID', '2817778635732157957'),
        to=to, from_=TELNYX_PHONE_NUMBER,
        webhook_url=os.environ.get('BASE_URL', 'https://web-production-47d4.up.railway.app') + '/api/telnyx/webhook'
    )
    active_calls[call.call_control_id] = {'to': to, 'message': message, 'status': 'initiated', 'created_at': datetime.utcnow().isoformat()}
    return {"success": True, "call_control_id": call.call_control_id, "to": to}

def make_elevenlabs_call_internal(to):
    if not elevenlabs_client or not AGENT_ID:
        raise Exception("ElevenLabs not configured")
    response = elevenlabs_client.conversational_ai.create_call(agent_id=AGENT_ID, phone_number=to)
    return {"success": True, "call_id": response.call_id, "to": to}

# ========================================
# CONTACTS MANAGEMENT
# ========================================

@app.route('/api/contacts', methods=['GET'])
def list_contacts():
    contacts = list(contacts_db.values())
    contacts.sort(key=lambda c: c.get('created_at', ''), reverse=True)
    return jsonify({"contacts": contacts, "count": len(contacts)})

@app.route('/api/contacts', methods=['POST'])
def add_contact():
    data = request.json
    if not data.get('phone'):
        return jsonify({"error": "Phone number is required"}), 400
    contact = {
        "id": str(uuid.uuid4()), "first_name": data.get('first_name', ''), "last_name": data.get('last_name', ''),
        "phone": data.get('phone', ''), "email": data.get('email', ''), "company": data.get('company', ''),
        "industry": data.get('industry', ''), "title": data.get('title', ''), "pain_point": data.get('pain_point', ''),
        "notes": data.get('notes', ''), "tags": data.get('tags', []), "status": "new",
        "created_at": datetime.utcnow().isoformat()
    }
    contacts_db[contact['id']] = contact
    return jsonify({"contact": contact, "message": "Contact added"})

@app.route('/api/contacts/<contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    if contact_id in contacts_db:
        del contacts_db[contact_id]
        return jsonify({"deleted": True})
    return jsonify({"error": "Contact not found"}), 404

@app.route('/api/contacts/bulk', methods=['POST'])
def bulk_add_contacts():
    data = request.json
    added = []
    for c in data.get('contacts', []):
        if not c.get('phone'):
            continue
        contact = {
            "id": str(uuid.uuid4()), "first_name": c.get('first_name', ''), "last_name": c.get('last_name', ''),
            "phone": c.get('phone', ''), "email": c.get('email', ''), "company": c.get('company', ''),
            "industry": c.get('industry', ''), "title": c.get('title', ''), "pain_point": c.get('pain_point', ''),
            "notes": c.get('notes', ''), "tags": c.get('tags', []), "status": "new",
            "created_at": datetime.utcnow().isoformat()
        }
        contacts_db[contact['id']] = contact
        added.append(contact)
    return jsonify({"created": len(added), "contacts": added, "message": f"Added {len(added)} contacts"})

@app.route('/api/contacts/upload-csv', methods=['POST'])
def upload_csv_contacts():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if not file.filename or not file.filename.lower().endswith('.csv'):
        return jsonify({"error": "File must be a .csv"}), 400
    try:
        content = file.read().decode('utf-8-sig')
    except UnicodeDecodeError:
        content = file.read().decode('latin-1')
    reader = csv.DictReader(io.StringIO(content))
    added, skipped = [], 0
    field_map = {
        'phone': ['phone', 'phone_number', 'telephone', 'tel', 'mobile', 'cell'],
        'first_name': ['first_name', 'first', 'firstname', 'given_name'],
        'last_name': ['last_name', 'last', 'lastname', 'surname', 'family_name'],
        'email': ['email', 'email_address', 'e-mail'],
        'company': ['company', 'company_name', 'organization', 'org', 'business'],
        'industry': ['industry', 'sector', 'vertical'],
        'title': ['title', 'job_title', 'position', 'role'],
        'pain_point': ['pain_point', 'pain', 'challenge', 'problem'],
        'notes': ['notes', 'note', 'comments', 'description'],
    }
    def find_field(row, aliases):
        for alias in aliases:
            for key in row:
                if key.strip().lower().replace(' ', '_').replace('-', '_') == alias:
                    return row[key].strip() if row[key] else ''
        return ''
    for row in reader:
        name = ''
        for key in row:
            if key.strip().lower().replace(' ', '_') in ['name', 'full_name', 'fullname', 'contact_name', 'contact']:
                name = row[key].strip() if row[key] else ''
        first_name = find_field(row, field_map['first_name'])
        last_name = find_field(row, field_map['last_name'])
        if not first_name and not last_name and name:
            parts = name.split(None, 1)
            first_name = parts[0] if parts else ''
            last_name = parts[1] if len(parts) > 1 else ''
        phone = find_field(row, field_map['phone'])
        if not phone:
            skipped += 1
            continue
        contact = {
            "id": str(uuid.uuid4()), "first_name": first_name, "last_name": last_name,
            "phone": phone, "email": find_field(row, field_map['email']),
            "company": find_field(row, field_map['company']), "industry": find_field(row, field_map['industry']),
            "title": find_field(row, field_map['title']), "pain_point": find_field(row, field_map['pain_point']),
            "notes": find_field(row, field_map['notes']), "tags": [], "status": "new",
            "created_at": datetime.utcnow().isoformat()
        }
        contacts_db[contact['id']] = contact
        added.append(contact)
    return jsonify({"created": len(added), "skipped": skipped, "contacts": added[:10],
                    "message": f"Imported {len(added)} contacts ({skipped} skipped - no phone)"})

@app.route('/api/contacts/clear', methods=['DELETE'])
def clear_all_contacts():
    count = len(contacts_db)
    contacts_db.clear()
    return jsonify({"deleted": count, "message": f"Cleared {count} contacts"})

@app.route('/api/contacts/template', methods=['GET'])
def download_template():
    csv_content = "first_name,last_name,phone,email,company,industry,title,pain_point,notes\nJohn,Smith,+15551234567,john@acme.com,Acme Construction,Construction,Owner,Scheduling chaos,Met at trade show\nJane,Doe,+15559876543,jane@fasthaul.com,Fast Haul LLC,Trucking,Operations Manager,Route optimization,Referral from Mike\n"
    return app.response_class(csv_content, mimetype='text/csv', headers={'Content-Disposition': 'attachment; filename=contacts_template.csv'})

# ========================================
# CALL CAMPAIGNS
# ========================================

@app.route('/api/campaigns', methods=['GET'])
def list_campaigns():
    campaigns = list(campaigns_db.values())
    campaigns.sort(key=lambda c: c.get('created_at', ''), reverse=True)
    return jsonify({"campaigns": campaigns, "count": len(campaigns)})

@app.route('/api/campaigns', methods=['POST'])
def create_campaign():
    data = request.json
    contact_ids = data.get('contact_ids', [])
    provider = data.get('provider', 'telnyx')
    if not contact_ids:
        return jsonify({"error": "No contacts selected"}), 400
    selected = [contacts_db[cid] for cid in contact_ids if cid in contacts_db]
    if not selected:
        return jsonify({"error": "No valid contacts found"}), 400
    campaign = {
        "id": str(uuid.uuid4()), "name": data.get('name', f"Campaign {datetime.utcnow().strftime('%m/%d %I:%M%p')}"),
        "provider": provider, "script": data.get('script', ''), "status": "ready",
        "total": len(selected), "completed": 0, "connected": 0,
        "contacts": [{"id": c["id"], "phone": c["phone"], "name": f"{c['first_name']} {c['last_name']}".strip(),
                       "company": c.get("company", ""), "outcome": "pending"} for c in selected],
        "created_at": datetime.utcnow().isoformat()
    }
    campaigns_db[campaign['id']] = campaign
    return jsonify({"campaign": campaign, "message": f"Campaign created with {len(selected)} contacts"})

@app.route('/api/campaigns/<campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    campaign = campaigns_db.get(campaign_id)
    if not campaign:
        return jsonify({"error": "Campaign not found"}), 404
    return jsonify({"campaign": campaign})

@app.route('/api/campaigns/<campaign_id>/start', methods=['POST'])
def start_campaign(campaign_id):
    campaign = campaigns_db.get(campaign_id)
    if not campaign:
        return jsonify({"error": "Campaign not found"}), 404
    provider = campaign.get('provider', 'telnyx')
    results = []
    delay = request.json.get('delay', 2) if request.json else 2
    campaign['status'] = 'in_progress'
    for i, contact in enumerate(campaign['contacts']):
        if contact['outcome'] != 'pending':
            continue
        try:
            if i > 0:
                import time
                time.sleep(delay)
            if provider == 'elevenlabs':
                result = make_elevenlabs_call_internal(contact['phone'])
            else:
                result = make_telnyx_call_internal(contact['phone'], campaign.get('script', 'Hello! This is an AI assistant calling on behalf of Trapier Management.'))
            contact['outcome'] = 'called'
            contact['call_result'] = result
            campaign['completed'] += 1
            results.append({"contact": contact['name'], "phone": contact['phone'], "result": result})
        except Exception as e:
            contact['outcome'] = 'failed'
            contact['error'] = str(e)
            results.append({"contact": contact['name'], "phone": contact['phone'], "error": str(e)})
    campaign['status'] = 'completed'
    return jsonify({"campaign_id": campaign_id, "results": results, "total_called": len(results)})

@app.route('/api/campaigns/<campaign_id>/log', methods=['POST'])
def log_campaign_outcome(campaign_id):
    campaign = campaigns_db.get(campaign_id)
    if not campaign:
        return jsonify({"error": "Campaign not found"}), 404
    data = request.json
    contact = next((c for c in campaign['contacts'] if c['id'] == data.get('contact_id')), None)
    if not contact:
        return jsonify({"error": "Contact not found"}), 404
    contact['outcome'] = data.get('outcome', 'no_answer')
    contact['notes'] = data.get('notes', '')
    contact['logged_at'] = datetime.utcnow().isoformat()
    if contact['outcome'] in ('connected', 'interested', 'booked'):
        campaign['connected'] += 1
    return jsonify({"success": True, "contact": contact})

@app.route('/api/campaigns/<campaign_id>', methods=['DELETE'])
def delete_campaign(campaign_id):
    if campaign_id in campaigns_db:
        del campaigns_db[campaign_id]
        return jsonify({"deleted": True})
    return jsonify({"error": "Campaign not found"}), 404

# ========================================
# BULK CONTACTS FRONTEND PAGE
# ========================================

CONTACTS_PAGE = """<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Harpoon AI - Bulk Contacts</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-950 text-gray-100 min-h-screen">
<nav class="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
<div class="flex items-center gap-3"><span class="text-2xl">&#x1F3AF;</span><span class="text-xl font-bold">Harpoon AI</span></div>
<div class="flex gap-4 text-sm"><a href="/" class="text-gray-400 hover:text-white">Outbound Calls</a><a href="/contacts" class="text-blue-400 font-medium">Bulk Contacts</a></div></nav>
<div class="max-w-5xl mx-auto px-6 py-8">
<div class="flex justify-between items-center mb-6"><div><h1 class="text-2xl font-bold">Bulk Contacts</h1><p class="text-gray-400 text-sm mt-1">Upload CSV, manage contacts, launch call campaigns</p></div>
<a href="/api/contacts/template" class="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700">Download Template</a></div>
<div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6"><h2 class="text-lg font-semibold mb-3">Upload Contacts CSV</h2>
<form id="csvForm" class="flex gap-3 items-end"><div class="flex-1"><input type="file" id="csvFile" accept=".csv" class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"></div>
<button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Upload</button></form>
<p id="uploadStatus" class="text-sm mt-3 text-gray-400"></p></div>
<div class="grid grid-cols-3 gap-4 mb-6">
<div class="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"><p class="text-3xl font-bold text-blue-400" id="totalContacts">0</p><p class="text-xs text-gray-500 mt-1">Contacts</p></div>
<div class="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"><p class="text-3xl font-bold text-green-400" id="totalCampaigns">0</p><p class="text-xs text-gray-500 mt-1">Campaigns</p></div>
<div class="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"><p class="text-3xl font-bold text-purple-400" id="totalCalled">0</p><p class="text-xs text-gray-500 mt-1">Calls Made</p></div></div>
<div class="bg-gray-900 border border-gray-800 rounded-xl mb-6">
<div class="flex items-center justify-between p-4 border-b border-gray-800"><h2 class="font-semibold">Contacts (<span id="cc">0</span>)</h2>
<div class="flex gap-2"><button onclick="selAll()" class="px-3 py-1.5 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700">Select All</button>
<button onclick="launchCamp()" id="launchBtn" class="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50" disabled>Call Selected (0)</button>
<button onclick="clrAll()" class="px-3 py-1.5 bg-red-900/50 text-red-400 rounded text-xs hover:bg-red-900">Clear All</button></div></div>
<div class="overflow-x-auto max-h-96 overflow-y-auto"><table class="w-full text-sm"><thead class="sticky top-0 bg-gray-900">
<tr class="border-b border-gray-800 text-left"><th class="px-4 py-2 w-8"><input type="checkbox" id="chkAll" onchange="togAll(this)"></th>
<th class="px-4 py-2 text-gray-400 text-xs">NAME</th><th class="px-4 py-2 text-gray-400 text-xs">PHONE</th>
<th class="px-4 py-2 text-gray-400 text-xs">COMPANY</th><th class="px-4 py-2 text-gray-400 text-xs">INDUSTRY</th>
<th class="px-4 py-2 text-gray-400 text-xs">STATUS</th></tr></thead><tbody id="tbl"></tbody></table></div>
<div class="p-3 border-t border-gray-800 text-xs text-gray-500" id="tblFoot"></div></div>
<div id="campPanel" class="bg-gray-900 border border-green-800/50 rounded-xl p-6 mb-6 hidden">
<h2 class="text-lg font-semibold text-green-400 mb-4">Launch Call Campaign</h2>
<div class="grid grid-cols-2 gap-4 mb-4"><div><label class="block text-xs text-gray-400 mb-1">Campaign Name</label>
<input id="cName" type="text" placeholder="Q1 Cold Outreach" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"></div>
<div><label class="block text-xs text-gray-400 mb-1">Provider</label><select id="cProv" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
<option value="telnyx">Telnyx + OpenAI</option><option value="elevenlabs">ElevenLabs Agent</option></select></div></div>
<div class="mb-4"><label class="block text-xs text-gray-400 mb-1">Call Script</label>
<textarea id="cScript" rows="3" placeholder="Hi, this is Harper from Trapier Management..." class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"></textarea></div>
<div class="flex gap-2"><button onclick="startCamp()" class="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Start Calling All</button>
<button onclick="closeCamp()" class="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm">Cancel</button></div>
<p id="campStat" class="text-sm mt-3"></p></div></div>
<script>
var ct=[],sel=new Set(),cid=null;
async function loadC(){var r=await fetch('/api/contacts');var d=await r.json();ct=d.contacts||[];render();document.getElementById('totalContacts').textContent=ct.length;document.getElementById('cc').textContent=ct.length;}
async function loadS(){var r=await fetch('/api/campaigns');var d=await r.json();var c=d.campaigns||[];document.getElementById('totalCampaigns').textContent=c.length;document.getElementById('totalCalled').textContent=c.reduce(function(s,x){return s+(x.completed||0);},0);}
function render(){var t=document.getElementById('tbl');if(!ct.length){t.innerHTML='<tr><td colspan="6" class="px-4 py-12 text-center text-gray-500">No contacts yet. Upload a CSV.</td></tr>';document.getElementById('tblFoot').textContent='';updBtn();return;}
t.innerHTML=ct.map(function(c){return '<tr class="border-t border-gray-800/50 hover:bg-gray-800/30 '+(sel.has(c.id)?'bg-green-900/10':'')+'"><td class="px-4 py-2"><input type="checkbox" '+(sel.has(c.id)?'checked':'')+' onchange="tog(\''+c.id+'\')"></td><td class="px-4 py-2 font-medium">'+c.first_name+' '+c.last_name+'</td><td class="px-4 py-2 text-gray-400">'+c.phone+'</td><td class="px-4 py-2 text-gray-400">'+(c.company||'-')+'</td><td class="px-4 py-2 text-gray-400">'+(c.industry||'-')+'</td><td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-xs '+(c.status==='new'?'bg-blue-900/50 text-blue-400':'bg-gray-800 text-gray-400')+'">'+c.status+'</span></td></tr>';}).join('');
document.getElementById('tblFoot').textContent=ct.length+' contacts';updBtn();}
function tog(id){sel.has(id)?sel.delete(id):sel.add(id);render();}
function togAll(el){ct.forEach(function(c){el.checked?sel.add(c.id):sel.delete(c.id);});render();}
function selAll(){ct.forEach(function(c){sel.add(c.id);});render();document.getElementById('chkAll').checked=true;}
function updBtn(){var b=document.getElementById('launchBtn');b.textContent='Call Selected ('+sel.size+')';b.disabled=sel.size===0;}
function launchCamp(){if(!sel.size)return;document.getElementById('campPanel').classList.remove('hidden');document.getElementById('cName').value='Campaign '+new Date().toLocaleDateString()+' ('+sel.size+')';}
function closeCamp(){document.getElementById('campPanel').classList.add('hidden');}
async function startCamp(){var ids=Array.from(sel),n=document.getElementById('cName').value,p=document.getElementById('cProv').value,s=document.getElementById('cScript').value,st=document.getElementById('campStat');
st.textContent='Creating...';st.className='text-sm mt-3 text-yellow-400';
var r=await fetch('/api/campaigns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contact_ids:ids,name:n,provider:p,script:s})});var d=await r.json();
if(!d.campaign){st.textContent=d.error||'Failed';st.className='text-sm mt-3 text-red-400';return;}
cid=d.campaign.id;st.textContent='Starting '+ids.length+' calls...';
var r2=await fetch('/api/campaigns/'+cid+'/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({delay:2})});var d2=await r2.json();
st.textContent='Done! '+(d2.total_called||0)+' calls made.';st.className='text-sm mt-3 text-green-400';sel.clear();loadC();loadS();}
async function clrAll(){if(!confirm('Delete all contacts?'))return;await fetch('/api/contacts/clear',{method:'DELETE'});sel.clear();loadC();}
document.getElementById('csvForm').addEventListener('submit',async function(e){e.preventDefault();var f=document.getElementById('csvFile').files[0];if(!f)return;
var st=document.getElementById('uploadStatus');st.textContent='Uploading...';st.className='text-sm mt-3 text-yellow-400';
var fd=new FormData();fd.append('file',f);var r=await fetch('/api/contacts/upload-csv',{method:'POST',body:fd});var d=await r.json();
st.textContent=d.message||'Imported '+d.created+' contacts';st.className='text-sm mt-3 text-green-400';document.getElementById('csvFile').value='';loadC();loadS();});
loadC();loadS();
</script></body></html>"""

@app.route('/contacts')
def contacts_page():
    return render_template_string(CONTACTS_PAGE)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Harpoon server on port {port}")
    print(f"Telnyx: {TELNYX_PHONE_NUMBER}")
    if AGENT_ID:
        print(f"ElevenLabs Agent: {AGENT_ID[:12]}...")
    print(f"Bulk contacts: /contacts")
    app.run(host='0.0.0.0', port=port, debug=False)
