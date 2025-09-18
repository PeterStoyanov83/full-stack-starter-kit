<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Tool;
use App\Models\Category;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Get dashboard data with Bulgarian greeting based on user role
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Role display mapping in Bulgarian
        $roleDisplayNames = [
            'owner' => 'Owner',
            'frontend' => 'Frontend разработчик',
            'backend' => 'Backend разработчик',
            'pm' => 'Project Manager',
            'qa' => 'QA тестер',
            'designer' => 'Дизайнер',
        ];

        $roleDisplay = $roleDisplayNames[$user->role] ?? ucfirst($user->role);

        // Cache dashboard statistics
        $stats = Cache::remember('dashboard_stats', 900, function () {
            return [
                'total_tools' => Tool::count(),
                'approved_tools' => Tool::approved()->count(),
                'pending_tools' => Tool::pending()->count(),
                'rejected_tools' => Tool::rejected()->count(),
                'total_categories' => Category::count(),
                'active_categories' => Category::active()->count(),
                'total_users' => User::count(),
                'tools_by_category' => Category::withCount('tools')->get()->pluck('tools_count', 'name'),
                'recent_tools' => Tool::latest()->take(5)->with('category', 'creator')->get(),
            ];
        });

        return response()->json([
            'greeting' => "Здравей, {$user->name}! Ти си с роля: {$roleDisplay}.",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_display' => $roleDisplay,
                'profile_status' => $user->profile_status ?? 'active',
                'has_2fa_enabled' => $user->hasTwoFactorEnabled(),
            ],
            'stats' => $stats,
            'current_time' => now()->format('Y-m-d H:i:s'),
            'permissions' => $this->getRolePermissions($user->role),
        ]);
    }

    /**
     * Get role-based permissions for frontend
     */
    private function getRolePermissions($role)
    {
        $permissions = [
            'owner' => [
                'can_manage_users' => true,
                'can_view_analytics' => true,
                'can_manage_system' => true,
                'can_access_admin' => true,
            ],
            'frontend' => [
                'can_view_ui_components' => true,
                'can_edit_frontend' => true,
                'can_view_design_system' => true,
            ],
            'backend' => [
                'can_view_api_docs' => true,
                'can_manage_database' => true,
                'can_view_server_logs' => true,
            ],
            'pm' => [
                'can_view_project_status' => true,
                'can_manage_tasks' => true,
                'can_view_reports' => true,
            ],
            'qa' => [
                'can_run_tests' => true,
                'can_report_bugs' => true,
                'can_view_test_results' => true,
            ],
            'designer' => [
                'can_access_design_tools' => true,
                'can_manage_assets' => true,
                'can_view_style_guide' => true,
            ],
        ];

        return $permissions[$role] ?? [];
    }
}
