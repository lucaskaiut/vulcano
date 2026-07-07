<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Custos</title>
<style>body{font-family:sans-serif;font-size:11px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:5px 7px;text-align:left}th{background:#f5f5f5;font-weight:600}h1{font-size:18px;margin-bottom:16px}.total{font-weight:600}</style>
</head>
<body>
<h1>Relatório de Custos</h1>
<table>
<thead><tr>@foreach(($headers ?? ['Colaborador','Categoria','Valor']) as $h)<th>{{$h}}</th>@endforeach</tr></thead>
<tbody>
@php $totals = []; @endphp
@foreach($rows as $row)
  @foreach($row['categories'] as $cat => $val)
  <tr>
    @foreach(($headers ?? ['Colaborador','Categoria','Valor']) as $h)
    @if($h === 'Colaborador')<td>{{$row['user_name']}}</td>
    @elseif($h === 'Categoria')<td>{{$cat}}</td>
    @elseif($h === 'Valor')<td>R$ {{number_format((float)$val,2,',','.')}}</td>
    @endif
    @endforeach
  </tr>
  @php
    $totals[$row['user_name']] = ($totals[$row['user_name']] ?? 0) + (float)$val;
  @endphp
  @endforeach
@endforeach
</tbody>
</table>

<h2 style="margin-top:24px;font-size:14px">Totais por colaborador</h2>
<table>
<thead><tr><th>Colaborador</th><th>Total</th></tr></thead>
<tbody>
@foreach($totals as $name => $total)
<tr class="total"><td>{{$name}}</td><td>R$ {{number_format($total,2,',','.')}}</td></tr>
@endforeach
</tbody>
</table>

<p style="margin-top:20px;color:#999">Gerado em {{now()->format('d/m/Y H:i')}}</p>
</body>
</html>
