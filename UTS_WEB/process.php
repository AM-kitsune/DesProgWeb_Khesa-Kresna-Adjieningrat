<?php
$dataFile = 'data_laundry.json';

function getOrders() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        file_put_contents($dataFile, '[]');
        return [];
    }
    $json = file_get_contents($dataFile);
    return json_decode($json, true);
}

function saveOrders($orders) {
    global $dataFile;
    $json = json_encode($orders, JSON_PRETTY_PRINT);
    file_put_contents($dataFile, $json);
}

function generateHtmlResponse($orders) {
    $response = '';
    if (empty($orders)) {
        return '<p class="no-data">Belum ada data pesanan.</p>';
    }
    $reversed_orders = array_reverse($orders);
    foreach ($reversed_orders as $order) {
        $status_class = strtolower($order['status']);
        $response .= '<div class="order-entry" data-id="' . $order['id'] . '" data-status="' . $order['status'] . '">';
        $response .= '<input type="checkbox" class="order-checkbox" data-id="' . $order['id'] . '">';
        $response .= '<div class="order-details">';
        $response .= '<p><strong>Nama:</strong> <span data-property="nama">' . htmlspecialchars($order['nama']) . '</span></p>';
        $response .= '<p><strong>Telepon:</strong> <span data-property="telepon">' . htmlspecialchars($order['telepon']) . '</span></p>';
        $response .= '<p><strong>Layanan:</strong> <span data-property="layanan">' . htmlspecialchars($order['layanan']) . '</span></p>';
        $response .= '<p><strong>Berat:</strong> <span><span data-property="berat">' . htmlspecialchars($order['berat']) . '</span> kg</span></p>';
        $response .= '<p><strong>Total Harga:</strong> <span>Rp ' . number_format($order['total_harga'], 0, ',', '.') . '</span></p>';
        $response .= '</div>';
        $response .= '<div class="order-actions">';
        $response .= '<span class="status status-' . $status_class . '">' . $order['status'] . '</span>';
        if ($order['status'] == 'Pending') {
            $response .= '<button class="btn-selesai" data-id="' . $order['id'] . '">Selesaikan</button>';
        }
        $response .= '<button class="btn-edit" data-id="' . $order['id'] . '">Edit</button>';        
        $response .= '</div>';
        $response .= '</div>';
        $response  .= '<button class="btn-hapus" data-id="<?php echo $order['id']; ?>">Hapus</button>'

    }
    return $response;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = $_POST['action'] ?? '';
    $orders = getOrders();
    $prices = ['Cuci Kering Lipat' => 7000, 'Cuci Setrika' => 9000, 'Setrika Saja' => 6000];

    if ($action == 'add') {
        $nama = trim($_POST['nama']);
        $telepon = trim($_POST['telepon']);
        $berat = (float) $_POST['berat'];
        $layanan = trim($_POST['layanan']);
        $status = trim($_POST['status']);
        $harga_per_kg = $prices[$layanan] ?? 0;
        $total_harga = $berat * $harga_per_kg;

        $newOrder = [
            'id' => uniqid('order_'),
            'nama' => $nama,
            'telepon' => $telepon,
            'berat' => $berat,
            'layanan' => $layanan,
            'total_harga' => $total_harga,
            'status' => $status
        ];
        array_push($orders, $newOrder);
    } 
    elseif ($action == 'update_status') {
        $orderId = $_POST['id'];
        foreach ($orders as &$order) {
            if ($order['id'] == $orderId) {
                $order['status'] = 'Selesai';
                break;
            }
        }
    } 
    elseif ($action == 'bulk_update_status') {
        $orderIds = $_POST['ids'] ?? [];
        foreach ($orders as &$order) {
            if (in_array($order['id'], $orderIds)) {
                $order['status'] = 'Selesai';
            }
        }
    }
    elseif ($action == 'edit_order') {
        $orderId = $_POST['id'];
        foreach ($orders as &$order) {
            if ($order['id'] == $orderId) {
                $order['nama'] = trim($_POST['nama']);
                $order['telepon'] = trim($_POST['telepon']);
                $order['berat'] = (float) $_POST['berat'];
                $order['layanan'] = trim($_POST['edit_layanan']);
                $order['status'] = trim($_POST['edit_status']);
                
                $harga_per_kg = $prices[$order['layanan']] ?? 0;
                $order['total_harga'] = $order['berat'] * $harga_per_kg;
                
                break;
            }
        }
    }

    saveOrders($orders);
    echo generateHtmlResponse($orders);

} else {
    $orders = getOrders();
    echo generateHtmlResponse($orders);
}
?> 